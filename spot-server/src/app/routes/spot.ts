import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

import uuid from 'uuid';

// db
import prismaSpot from '@db/prisma/spot.js';
import prismaReport from '@db/prisma/report.js';
import prismaSpotRating from '@db/prisma/spotRating.js';

// services
import spotService from '@services/spot.js';
import locationService from '@services/location.js';
import imageService from '@services/image.js';
import authorizationService from '@services/authorization.js';
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
import { UserRole } from '@models/user.js';
import { SearchType, LocationType } from '@models/userMetadata.js';
import { ReportCategory } from '@models/report.js';
import {
  Spot,
  SpotRatingType,
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
  DeleteSpotRequest,
  DeleteSpotResponse,
  ReportSpotRequest,
  ReportSpotResponse,
  GetSpotActivityRequest,
  GetSpotActivityResponse
} from '@models/spot.js';

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
      // Must be a user to get mutiple spots
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      // Todo, make dynamic
      let queryLocationType: LocationType;
      switch (req.query?.locationType) {
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
      switch (req.query?.searchType) {
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
        before: req.query.before?.toString(),
        after: req.query.after?.toString(),
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

      let spots;
      if (query.after || query.before) {
        spots = await prismaSpot.findSpotsWithCursor(
          req.user.userId,
          query.options.searchType,
          query.options.locationType,
          query.location,
          query.before ? query.before : undefined,
          query.after ? query.after : undefined,
          query.limit
        );
      } else {
        spots = await prismaSpot.findSpots(
          req.user.userId,
          query.options.searchType,
          query.options.locationType,
          query.location,
          query.limit
        );
      }

      // add the location props
      const spotsWithLocation = locationService.addLocationPropsToSpots(
        spots,
        query.location,
        { hideDistance: true }
      );

      // Add your rating
      const spotsWithLocationAndRating: Spot[] = await Promise.all(
        spotsWithLocation.map(async (spot) => {
          const newSpot: Spot = {
            ...spot,
            myRating: SpotRatingType.NONE,
            owned: false
          };
          if (req.user) {
            const spotRating = await prismaSpotRating.findRatingForUserAndSpot(
              req.user.userId,
              spot.spotId
            );
            if (spotRating) {
              newSpot.myRating = spotRating.rating;
            }
          }
          return newSpot;
        })
      );

      const l = spotsWithLocationAndRating.length;
      const response: GetSpotResponse = {
        spots: spotsWithLocationAndRating,
        initialLoad: query.initialLoad,
        cursor: {
          before: l > 0 ? spotsWithLocationAndRating[0].spotId : null,
          after: l > 0 ? spotsWithLocationAndRating[l-1].spotId : null
        }
      };
      res.status(200).json(response);
    }
  )
);

// Create a spot
router.post(
  '/',
  rateLimiter.createSpotLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // You must be a user to create a spot
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }
      const userId = req.user.userId;

      // You must be verified to make a post
      if (!req.user.verifiedAt) {
        return next(new authenticationError.VerifyError());
      }

      if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
        return next(new spotError.CreateSpot());
      }

      // Upload the file
      singleUpload(req, res, async (err: any) => {
        // error uploading image
        if (err) {
          return next(new spotError.SpotImage(422));
        }

        const body: CreateSpotRequest = JSON.parse(req.body.json);
        // @ts-ignore
        // Location is defined on the multers3 file type
        const imageSrc: string = req.file ? req.file.location : null;
        const spotId = req.file?.filename.split('.')[0] || uuid.v4();

        // remove leading and trailing whitespaces
        body.content = body.content.trim();
        // check if line length matches
        if (
          body.content.split(/\r\n|\r|\n/).length >
          SPOT_CONSTANTS.MAX_LINE_LENGTH
        ) {
          return next(
            new spotError.InvalidSpotLineLength(
              400,
              SPOT_CONSTANTS.MAX_LINE_LENGTH
            )
          );
        }
        // You must either have some text or an image
        if (body.content.length == 0 && !imageSrc) {
          return next(new spotError.NoSpotContent(400));
        }
        const contentError = spotService.checkValidSpotContent(body.content);
        if (contentError) {
          return next(contentError);
        }

        // Test nsfw, locally if needed
        const link = await spotService.generateSpotLink();
        let imageNsfw = false;
        if (config.testNsfwLocal && imageSrc) {
          try {
            imageNsfw = await imageService.predictNsfwLocal(imageSrc);
          } catch (err) {
            // do nothing
          }
        }

        // get geolocation
        const geolocation = await locationService.getGeolocation(body.location);
        const createdSpot = await prismaSpot.createSpot(
          spotId,
          userId,
          body.content,
          body.location,
          imageSrc,
          imageNsfw,
          link,
          geolocation
        );

        // Nsfw check using lambda in the background, do not wait
        if (config.testNsfwLambda && imageSrc) {
          imageService
            .predictNsfwLambda(imageSrc)
            .then((result: AWS.Lambda.InvocationResponse) => {
              if (result?.StatusCode === 200 && result.Payload) {
                const payload = JSON.parse(result.Payload.toString());
                if (payload.statusCode === 200) {
                  const predictionResult = JSON.parse(payload.body);
                  const isNsfw =
                    predictionResult?.className === 'Porn' ||
                    predictionResult?.className === 'Hentai';
                  prismaSpot.updateNsfw(createdSpot.spotId, isNsfw);
                }
              }
            });
        }

        // add the location props
        const spotWithLocation = locationService.addLocationPropsToSpots(
          [createdSpot],
          body.location,
          { hideDistance: true }
        );

        // Add your rating
        const spotWithLocationAndRating: Spot[] = await Promise.all(
          spotWithLocation.map(async (spot) => {
            const newSpot: Spot = {
              ...spot,
              myRating: SpotRatingType.NONE,
              owned: false
            };
            if (req.user) {
              const spotRating =
                await prismaSpotRating.findRatingForUserAndSpot(
                  req.user.userId,
                  spot.spotId
                );
              if (spotRating) {
                newSpot.myRating = spotRating.rating;
              }
            }
            return newSpot;
          })
        );

        const response: CreateSpotResponse = {
          spot: spotWithLocationAndRating[0]
        };
        res.status(200).json(response);
      });
    }
  )
);

// Rate a spot (like/dislike)
router.put(
  '/:spotId/rating/:rating',
  rateLimiter.genericSpotLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // Must be a user to rate a spot
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
        return next(new spotError.RateSpot());
      }

      let spotRating: SpotRatingType;
      if (req.params.rating === 'like') {
        spotRating = SpotRatingType.LIKE;
      } else if (req.params.rating === 'dislike') {
        spotRating = SpotRatingType.DISLIKE;
      } else {
        spotRating = SpotRatingType.NONE;
      }

      const params: RateSpotRequest = {
        spotId: req.params.spotId,
        rating: spotRating
      };

      const rating = await prismaSpotRating.rateSpot(
        req.user.userId,
        params.spotId,
        params.rating
      );
      if (!rating) {
        return next(new spotError.RateSpot());
      }

      const response: RateSpotResponse = {};
      res.status(200).json(response);
    }
  )
);

// remove a rating from a spot
router.delete(
  '/:spotId/rating',
  rateLimiter.genericSpotLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
        return next(new spotError.DeleteRatingSpot());
      }

      const params: DeleteRatingRequest = {
        spotId: req.params.spotId
      };

      const rating = prismaSpotRating.deleteRating(
        req.user.userId,
        params.spotId
      );
      if (!rating) {
        return next(new spotError.DeleteRatingSpot());
      }

      const response: DeleteRatingResponse = {};
      res.status(200).json(response);
    }
  )
);

// Delete a spot
router.delete(
  '/:spotId',
  rateLimiter.genericSpotLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // You must be a user
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
        return next(new spotError.DeleteSpot());
      }

      const params: DeleteSpotRequest = {
        spotId: req.params.spotId
      };

      // Check you own the spot, if you are not an admin or owner
      if (
        !authorizationService.checkUserHasRole(req.user, [
          UserRole.OWNER,
          UserRole.ADMIN
        ])
      ) {
        const spot = await prismaSpot.findSpotById(params.spotId);
        if (!spot || spot.owner !== req.user.userId) {
          return next(new spotError.DeleteSpot());
        }
      }

      const deletedSpot = await prismaSpot.softDeleteSpot(params.spotId);
      const response: DeleteSpotResponse = {};
      res.status(200).json(response);
    }
  )
);

// report a spot
router.post(
  '/:spotId/report',
  rateLimiter.genericSpotLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // You must be a user to report
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
        return next(new reportError.ReportError());
      }

      let reportCategory: ReportCategory;
      switch (req.body.category) {
        case 'offensive':
          reportCategory = ReportCategory.OFFENSIVE;
          break;
        case 'hate':
          reportCategory = ReportCategory.HATE;
          break;
        case 'mature':
          reportCategory = ReportCategory.MATURE;
          break;
        case 'other':
          reportCategory = ReportCategory.OTHER;
          break;
        default:
          reportCategory = ReportCategory.OFFENSIVE;
      }

      const params: ReportSpotRequest = {
        spotId: req.params.spotId,
        content: req.body.content,
        category: reportCategory
      };

      if (
        params.content.length < REPORT_CONSTANTS.MIN_CONTENT_LENGTH ||
        params.content.length > REPORT_CONSTANTS.MAX_CONTENT_LENGTH
      ) {
        return next(
          new reportError.ReportLengthError(
            400,
            REPORT_CONSTANTS.MIN_CONTENT_LENGTH,
            REPORT_CONSTANTS.MAX_CONTENT_LENGTH
          )
        );
      }

      const report = await prismaReport.createSpotReport(
        params.spotId,
        req.user.userId,
        params.content,
        params.category
      );
      if (!report) {
        return next(new reportError.ReportError());
      }
      const response: ReportSpotResponse = {};
      res.status(200).send(response);
    }
  )
);

// Get spot activity
router.get(
  '/activity',
  rateLimiter.genericSpotLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // You must be a user to get activity
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      const query: GetSpotActivityRequest = {
        limit: Number(req.query.limit),
        before: req.query.before
          ? new Date(req.query.before.toString())
          : undefined,
        after: req.query.after
          ? new Date(req.query.after.toString())
          : undefined,
        location: {
          latitude: Number(req.query.latitude),
          longitude: Number(req.query.longitude)
        }
      };

      const spotActivity = await prismaSpot.findSpotActivity(
        req.user.userId,
        query.before ? query.before : undefined,
        query.after ? query.after : undefined,
        query.limit,
        query.location
      );

      // Add location
      const spotActivityWithLocation = locationService.addLocationPropsToSpots(
        spotActivity,
        query.location,
        { hideDistance: true }
      );

      // Add your rating
      const spotActivityWithLocationAndRating: Spot[] = await Promise.all(
        spotActivityWithLocation.map(async (spot) => {
          const newSpot: Spot = {
            ...spot,
            myRating: SpotRatingType.NONE,
            owned: false
          };
          if (req.user) {
            const spotRating = await prismaSpotRating.findRatingForUserAndSpot(
              req.user.userId,
              spot.spotId
            );
            if (spotRating) {
              newSpot.myRating = spotRating.rating;
            }
          }
          return newSpot;
        })
      );

      const response: GetSpotActivityResponse = {
        activity: spotActivityWithLocationAndRating,
        size: spotActivityWithLocation.length,
        cursor: {
          before:
            spotActivityWithLocation.length > 0
              ? spotActivityWithLocation[0].createdAt
              : null,
          after:
            spotActivityWithLocation.length > 0
              ? spotActivityWithLocation[spotActivityWithLocation.length - 1]
                  .createdAt
              : null
        }
      };
      res.status(200).json(response);
    }
  )
);

// Get a single spot
// you do not need to be a user to complete this action
router.get(
  '/:spotLink',
  rateLimiter.genericSpotLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // getting individual posts does not need an account
      const postLink = req.params.postLink;

      const query: GetSingleSpotRequest = {
        spotLink: req.params.spotLink,
        // Optional location
        location: {
          latitude: Number(req.query.latitude),
          longitude: Number(req.query.longitude)
        }
      };

      const spot = await prismaSpot.findSpotByLink(
        query.spotLink,
        req.user?.userId
      );
      if (!spot) {
        return next(new spotError.GetSingleSpot());
      }
      // Add location
      const spotWithLocation = locationService.addLocationPropsToSpots(
        [spot],
        query.location,
        { hideDistance: true }
      );

      // Add your rating
      const spotWithLocationAndRating: Spot[] = await Promise.all(
        spotWithLocation.map(async (spot) => {
          const newSpot: Spot = {
            ...spot,
            myRating: SpotRatingType.NONE,
            owned: false
          };
          if (req.user) {
            const spotRating = await prismaSpotRating.findRatingForUserAndSpot(
              req.user.userId,
              spot.spotId
            );
            if (spotRating) {
              newSpot.myRating = spotRating.rating;
            }
          }
          return newSpot;
        })
      );

      const response: GetSingleSpotResponse = {
        spot: spotWithLocationAndRating[0]
      };
      res.status(200).json(response);
    }
  )
);

export default router;
