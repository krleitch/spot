import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

import uuid from 'uuid';

// db
import posts from '@db/posts.js';
import reports from '@db/reports.js';
import prismaSpot from '@db/../prisma/spot.js';
import prismaReport from '@db/../prisma/report.js';

// services
import postsService from '@services/posts.js';
import locationsService from '@services/locations.js';
import imageService from '@services/image.js';
import authorizationService from '@services/authorization/authorization.js';
const singleUpload = imageService.upload.single('image');

// errors
import * as spotError from '@exceptions/spot.js';
import * as reportError from '@exceptions/report.js';
import * as authenticationError from '@exceptions/authentication.js';
import ErrorHandler from '@helpers/errorHandler.js';

// ratelimiter
import rateLimiter from '@helpers/rateLimiter.js';

// constants
import { SPOT_CONSTANTS } from '@constants/spot.js';
import { REPORT_CONSTANTS } from '@constants/report.js';

// models
import { UserRole } from '@models/../newModels/user';
import { SearchType, LocationType } from '@models/../newModels/userMetadata';
import {
  GetSpotRequest,
  GetSpotResponse,
  GetSingleSpotRequest,
  GetSingleSpotResponse,
  CreateSpotRequest,
  CreateSpotResponse,
  RateSpotRequest,
  RateSpotResponse,
  DeleteRatingRequest,
  DeleteRatingResponse,
  ReportSpotRequest,
  ReportSpotResponse,
  GetSpotActivityRequest,
  GetSpotActivityResponse
} from '@models/../newModels/spot.js';

// config
import config from '@config/config.js';

router.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

// Get Spots
router.get(
  '/',
  rateLimiter.genericSpotLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // You must have an account
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      // Todo, make dynamic
      let queryLocationType: LocationType;
      switch (req.query?.location) {
        case 'GLOBAL':
          queryLocationType = LocationType.GLOBAL;
          break;
        case 'LOCAL':
          queryLocationType = LocationType.LOCAL;
          break;
        default:
          queryLocationType = LocationType.GLOBAL;
      }
      let querySearchType: SearchType;
      switch (req.query?.search) {
        case 'HOT':
          querySearchType = SearchType.HOT;
          break;
        case 'NEW':
          querySearchType = SearchType.NEW;
          break;
        default:
          querySearchType = SearchType.HOT;
      }

      const query: GetSpotRequest = {
        limit: Number(req.query.limit),
        before: req.query.before ? req.query.before.toString() : null,
        after: req.query.after ? req.query.after.toString() : null,
        initialLoad: req.query.initial ? Boolean(req.query.initial) : false,
        options: {
          locationType: queryLocationType,
          searchType: querySearchType
        },
        location: {
          latitude: Number(req.query.latitude),
          longitude: Number(req.query.longitude)
        }
      };

      let spots = await prismaSpot.findSpots(
        req.user.userId,
        query.options.searchType,
        query.options.locationType,
        query.location,
        query.before,
        query.after,
        query.limit
      );

      // add the distance
      spots = locationsService.addDistanceToRows(
        spots,
        query.location.latitude,
        query.location.longitude,
        true
      );

      const response: GetSpotResponse = {
        spots: spots,
        intialLoad: query.initialLoad,
        cursor: {
          before: '',
          after: ''
        }
      };
      res.status(200).json(response);
    }
  )
);

// Add a post
router.post(
  '/',
  rateLimiter.createPostLimiter,
  ErrorHandler.catchAsync(async (req: any, res: any, next: any) => {
    // You must have an account to make a post
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    // You must be verified to make a post
    if (!req.user.verifiedAt) {
      return next(new AuthenticationError.VerifyError(400));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new PostsError.PostError(500));
    }

    const accountId = req.user.id;
    const postId = uuid.v4();

    // set the filename for aws s3 bucket
    req.filename = postId;

    singleUpload(req, res, async function (err: any) {
      // error uploading image
      if (err) {
        return next(new PostsError.PostImage(422));
      }

      const json = JSON.parse(req.body.json);
      let content = json.content;
      const location = json.location;
      const image = req.file ? req.file.location : null;

      // remove leading and trailing whitespaces
      content = content.trim();

      // check if line length matches
      if (
        content.split(/\r\n|\r|\n/).length > POSTS_CONSTANTS.MAX_LINE_LENGTH
      ) {
        return next(
          new PostsError.InvalidPostLineLength(
            400,
            POSTS_CONSTANTS.MAX_LINE_LENGTH
          )
        );
      }

      // You must either have some text or an image
      if (content.length == 0 && !image) {
        return next(new PostsError.NoPostContent(400));
      }

      const contentError = postsService.validContent(content);
      if (contentError) {
        return next(contentError);
      }

      const link = await postsService.generateLink();

      let imageNsfw = false;
      if (config.testNsfwLocal && image) {
        try {
          imageNsfw = await imageService.predictNsfw(image);
        } catch (err) {
          // err
        }
      }

      locationsService
        .getGeolocation(location.latitude, location.longitude)
        .then(
          (geolocation: string) => {
            posts
              .addPost(
                postId,
                content,
                location,
                image,
                imageNsfw,
                link,
                accountId,
                geolocation
              )
              .then(
                (rows: any) => {
                  // async test nsfw
                  if (config.testNsfwLambda && image) {
                    imageService.predictNsfwLambda(image).then(
                      (result: any) => {
                        if (
                          Object.prototype.hasOwnProperty.call(
                            result,
                            'StatusCode'
                          ) &&
                          result.StatusCode === 200
                        ) {
                          const payload = JSON.parse(result.Payload);
                          if (payload.statusCode === 200) {
                            const predict = JSON.parse(payload.body);
                            if (
                              Object.prototype.hasOwnProperty.call(
                                predict,
                                'className'
                              )
                            ) {
                              const isNsfw =
                                predict.className === 'Porn' ||
                                predict.className === 'Hentai';
                              posts.updateNsfw(postId, isNsfw);
                            }
                          }
                        }
                      },
                      (err: any) => {}
                    );
                  }

                  rows = locationsService.addDistanceToRows(
                    rows,
                    location.latitude,
                    location.longitude,
                    true
                  );
                  const response = { post: rows[0] };
                  res.status(200).json(response);
                },
                (err: any) => {
                  return next(new PostsError.PostError(500));
                }
              );
          },
          (err: any) => {
            return next(new PostsError.PostError(500));
          }
        );
    });
  })
);

// Like a post
router.put(
  '/:postId/like',
  rateLimiter.genericPostLimiter,
  function (req: any, res: any, next: any) {
    // You must have an account to like a post
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new PostsError.LikePost(500));
    }

    const postId = req.params.postId;
    const accountId = req.user.id;

    posts.likePost(postId, accountId).then(
      (rows: any) => {
        const response = { postId: postId };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new PostsError.LikePost(500));
      }
    );
  }
);

// Dislike a post
router.put(
  '/:postId/dislike',
  rateLimiter.genericPostLimiter,
  function (req: any, res: any, next: any) {
    // You must have an account to dislike a post
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new PostsError.DislikePost(500));
    }

    const postId = req.params.postId;
    const accountId = req.user.id;

    posts.dislikePost(postId, accountId).then(
      (rows: any) => {
        const response = { postId: postId };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new PostsError.DislikePost(500));
      }
    );
  }
);

// remove like / dislike from post
router.put(
  '/:postId/unrated',
  rateLimiter.genericPostLimiter,
  function (req: any, res: any, next: any) {
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new PostsError.UnratedPost(500));
    }

    const postId = req.params.postId;
    const accountId = req.user.id;

    posts.unratedPost(postId, accountId).then(
      (rows: any) => {
        const response = { postId: postId };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new PostsError.UnratedPost(500));
      }
    );
  }
);

// Delete a post
router.delete(
  '/:postId',
  rateLimiter.genericPostLimiter,
  function (req: any, res: any, next: any) {
    // You must have an account to delete a post
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new PostsError.DeletePost(500));
    }

    const postId = req.params.postId;
    const accountId = req.user.id;

    posts.checkOwned(postId, accountId).then(
      (owned: boolean) => {
        if (
          owned ||
          authorization.checkRole(req.user, [roles.owner, roles.admin])
        ) {
          posts.deletePost(postId).then(
            (rows: any) => {
              const response = { postId: postId };
              res.status(200).json(response);
            },
            (err: any) => {
              return next(new PostsError.DeletePost(500));
            }
          );
        } else {
          return next(new PostsError.DeletePost(500));
        }
      },
      (err: any) => {
        return next(new PostsError.DeletePost(500));
      }
    );
  }
);

// report a post
router.put(
  '/:postId/report',
  rateLimiter.genericPostLimiter,
  function (req: any, res: any, next: any) {
    // You must have an account to report something
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new ReportError.ReportError(500));
    }

    const postId = req.params.postId;
    const accountId = req.user.id;
    const { content, category } = req.body;

    if (
      content.length < REPORT_CONSTANTS.MIN_CONTENT_LENGTH ||
      content.length > REPORT_CONSTANTS.MAX_CONTENT_LENGTH
    ) {
      return next(
        new ReportError.ReportLengthError(
          400,
          REPORT_CONSTANTS.MIN_CONTENT_LENGTH,
          REPORT_CONSTANTS.MAX_CONTENT_LENGTH
        )
      );
    }

    reports.addPostReport(postId, accountId, content, category).then(
      (rows: any) => {
        res.status(200).send({});
      },
      (err: any) => {
        return next(new ReportError.ReportError(500));
      }
    );
  }
);

// Get post activity
router.get(
  '/activity',
  rateLimiter.genericPostLimiter,
  function (req: any, res: any, next: any) {
    // You must have an account to see activity
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    const accountId = req.user.id;

    const before = req.query.before ? new Date(req.query.before) : null;
    const after = req.query.after ? new Date(req.query.after) : null;
    const limit = Number(req.query.limit);
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    posts.getPostsActivity(accountId, before, after, limit).then(
      (rows: any) => {
        rows = locationsService.addDistanceToRows(
          rows,
          latitude,
          longitude,
          true
        );
        const response = {
          activity: rows,
          size: rows.length,
          cursor: {
            before: rows.length > 0 ? rows[0].creation_date : null,
            after: rows.length > 0 ? rows[rows.length - 1].creation_date : null
          }
        };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new PostsError.PostActivity(500));
      }
    );
  }
);

// Get a single post
router.get(
  '/:postLink',
  rateLimiter.genericPostLimiter,
  function (req: any, res: any, next: any) {
    // getting individual posts does not need an account
    const postLink = req.params.postLink;

    // Optional - needed to supply distances
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    posts.getPostByLink(postLink, req.user ? req.user.id : null).then(
      (rows: any) => {
        if (rows.length < 1) {
          return next(new PostsError.GetSinglePost(500));
        }

        rows = locationsService.addDistanceToRows(
          rows,
          latitude,
          longitude,
          true
        );
        const response = { post: rows[0] };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new PostsError.GetSinglePost(500));
      }
    );
  }
);

export default router;
