import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

import { v4 as uuidv4 } from 'uuid';

// db
import prismaSpot from '@db/prisma/spot.js';
import prismaReport from '@db/prisma/report.js';
import prismaComment from '@db/prisma/comment.js';
import prismaCommentTag from '@db/prisma/commentTag.js';
import prismaNotification from '@db/prisma/notification.js';
import prismaCommentRating from '@db/prisma/commentRating.js';
import prismaUser from '@db/prisma/user.js';

// services
import commentService from '@services/comment.js';
import imageService from '@services/image.js';
import authorizationService from '@services/authorization.js';
const singleUpload = imageService.upload.single('image');

// ratelimiter
import rateLimiter from '@helpers/rateLimiter.js';

// errors
import * as commentError from '@exceptions/comment.js';
import * as authenticationError from '@exceptions/authentication.js';
import * as reportError from '@exceptions/report.js';
import ErrorHandler from '@helpers/errorHandler.js';

// constants
import { COMMENT_CONSTANTS } from '@constants/comment.js';
import { REPORT_CONSTANTS } from '@constants/report.js';

// config
import config from '@config/config.js';

// models
import { UserRole } from '@models/user.js';
import { ReportCategory } from '@models/report.js';
import {
  Comment,
  CommentActivity,
  CommentRatingType,
  GetCommentsRequest,
  GetCommentsResponse,
  GetRepliesRequest,
  GetRepliesResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  DeleteCommentRequest,
  DeleteCommentResponse,
  RateCommentRequest,
  RateCommentResponse,
  CreateReplyRequest,
  CreateReplyResponse,
  DeleteReplyRequest,
  DeleteReplyResponse,
  RateReplyRequest,
  RateReplyResponse,
  GetCommentActivityRequest,
  GetCommentActivityResponse,
  ReportCommentRequest,
  ReportCommentResponse,
} from '@models/comment.js';
import { NotificationType } from '@models/notification.js';

router.use((_req: Request, _res: Response, next: NextFunction) => {
  next();
});

// Get comment activity
router.get(
  '/activity',
  rateLimiter.genericCommentLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      const request: GetCommentActivityRequest = {
        before: req.query.before?.toString(),
        after: req.query.after?.toString(),
        limit: Number(req.query.limit)
      };

      const commentActivity = await prismaComment.findCommentActivity(
        req.user.userId,
        request.before,
        request.after,
        request.limit
      );

      const commentActivityWithTags = await commentService.addTagsToComments(
        commentActivity,
        req.user.userId
      );

      // add activity props
      const commentActivityWithTagsAndProps = await Promise.all(
        commentActivityWithTags.map(async (activity) => {
          const spot = await prismaSpot.findSpotById(
            activity.spotId,
            req.user?.userId
          );
          const parentComment = activity.parentCommentId
            ? await prismaComment.findCommentById(
                activity.parentCommentId,
                req.user?.userId
              )
            : null;

          const newActivity: CommentActivity = {
            ...activity,
            parentCommentImageSrc: parentComment
              ? parentComment.imageSrc
              : null,
            parentCommentImageNsfw: parentComment
              ? parentComment.imageNsfw
              : null,
            parentCommentLink: parentComment ? parentComment.link : null,
            spotImageSrc: spot ? spot.imageSrc : null,
            spotImageNsfw: spot ? spot.imageNsfw : null,
            spotLink: spot ? spot.link : ''
          };
          return newActivity;
        })
      );

      const response: GetCommentActivityResponse = {
        activity: commentActivityWithTagsAndProps,
        cursor: {
          before: commentActivityWithTagsAndProps.at(0)?.commentId,
          after: commentActivityWithTagsAndProps.at(-1)?.commentId
        }
      };
      res.status(200).json(response);
    }
  )
);

// Get all comments for a spot
router.get(
  '/:spotId',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const request: GetCommentsRequest = {
        spotId: req.params.spotId,
        commentLink: req.query.comment?.toString(),
        limit: Number(req.query.limit),
        before: req.query?.before?.toString(),
        after: req.query?.after?.toString()
      };

      let commentsArray: any[] = [];
      // If given a commentId we fetch that comment and everything after
      if (request.commentLink) {
        const comment = await prismaComment.findCommentByLink(
          request.commentLink,
          req.user?.userId
        );
        if (!comment) {
          return next(new commentError.GetComments());
        }
        // if its a reply, get from the parent
        if (comment.parentCommentId) {
          const parentComment = await prismaComment.findCommentById(
            comment.parentCommentId,
            req.user?.userId
          );
          request.before = parentComment?.commentId;
          commentsArray = commentsArray.concat(parentComment);
        } else {
          request.before = comment.commentId;
          commentsArray = commentsArray.concat(comment);
        }
        // we already got one comment
        request.limit -= 1;
      }

      const comments = await prismaComment.findCommentForSpot(
        request.spotId,
        request.before,
        request.after,
        request.limit
      );
      commentsArray = commentsArray.concat(comments);

      const commentsWithTags = await commentService.addTagsToComments(
        commentsArray,
        req.user?.userId
      );

      let totalCommentsBefore = 0;
      let totalCommentsAfter = 0;
      if (commentsWithTags.length > 0) {
        totalCommentsBefore = await prismaComment.findTotalCommentsBeforeDate(
          request.spotId,
          commentsWithTags.at(-1)?.createdAt
        );
        totalCommentsAfter = await prismaComment.findTotalCommentsAfterDate(
          request.spotId,
          commentsWithTags.at(0)?.createdAt
        );
      }

      const spot = await prismaSpot.findSpotById(request.spotId);
      if (!spot) {
        return next(new commentError.GetComments());
      }

      const commentsWithTagsAndProfilePicture =
        await commentService.addProfilePicturesToComments(
          commentsWithTags,
          spot.owner
        );

      // Add your rating
      const commentsWithTagsAndProfilePictureAndRating: Comment[] =
        await Promise.all(
          commentsWithTagsAndProfilePicture.map(async (comment) => {
            const newComment: Comment = {
              ...comment,
              myRating: CommentRatingType.NONE,
              owned: req.user?.userId === comment.owner
            };
            if (req.user) {
              const commentRating =
                await prismaCommentRating.findRatingForUserAndComment(
                  req.user.userId,
                  comment.commentId
                );
              if (commentRating) {
                newComment.myRating = commentRating.rating;
              }
            }
            return newComment;
          })
        );

      const response: GetCommentsResponse = {
        comments: commentsWithTagsAndProfilePictureAndRating,
        totalCommentsBefore: totalCommentsBefore,
        totalCommentsAfter: totalCommentsAfter,
        cursor: {
          before: commentsWithTagsAndProfilePictureAndRating.at(0)?.commentId,
          after: commentsWithTagsAndProfilePictureAndRating.at(-1)?.commentId
        }
      };
      res.status(200).json(response);
    }
  )
);

// Get all replies for a comment on a spot
router.get(
  '/:spotId/:commentId',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const request: GetRepliesRequest = {
        spotId: req.params.spotId,
        commentId: req.params.commentId,
        replyLink: req.query.reply?.toString(),
        limit: Number(req.query.limit),
        before: req.query?.before?.toString(),
        after: req.query?.before?.toString()
      };

      let replies: any;
      if (request.replyLink) {
        const reply = await prismaComment.findCommentByLink(
          request.replyLink,
          req.user?.userId
        );
        if (!reply) {
          return next(new commentError.GetReplies());
        }
        // If its a reply, get all replies up to this comment, else get replies normally
        // Todo: fix
        if (reply.parentCommentId == request.commentId) {
          // Up to the date since only sorted by createdAt currently
          replies = await prismaComment.findRepliesUpToReplyByCreatedAt(
            request.spotId,
            request.commentId,
            reply.createdAt,
            req.user?.userId
          );
          // Add the reply as the final
          replies.concat(reply);
        } else {
          replies = await prismaComment.findRepliesForComment(
            request.spotId,
            request.commentId,
            request.before,
            request.after,
            request.limit
          );
        }
      } else {
        replies = await prismaComment.findRepliesForComment(
          request.spotId,
          request.commentId,
          request.before,
          request.after,
          request.limit
        );
      }

      const spot = await prismaSpot.findSpotById(request.spotId);
      if (!spot) {
        return next(new commentError.GetReplies());
      }

      const repliesWithTags = await commentService.addTagsToComments(
        replies,
        req.user?.userId
      );
      const repliesWithTagsAndProfilePicture =
        await commentService.addProfilePicturesToComments(
          repliesWithTags,
          spot.owner
        );

      // Add your rating
      const repliesWithTagsAndProfilePictureAndRating: Comment[] =
        await Promise.all(
          repliesWithTagsAndProfilePicture.map(async (reply) => {
            const newReply: Comment = {
              ...reply,
              myRating: CommentRatingType.NONE,
              owned: req.user?.userId === reply.owner
            };
            if (req.user) {
              const commentRating =
                await prismaCommentRating.findRatingForUserAndComment(
                  req.user.userId,
                  reply.commentId
                );
              if (commentRating) {
                newReply.myRating = commentRating.rating;
              }
            }
            return newReply;
          })
        );

      let totalRepliesAfter = 0;
      if (replies.length > 0) {
        totalRepliesAfter = await prismaComment.findTotalRepliesAfterReply(
          request.spotId,
          request.commentId,
          replies.at(-1).commentId
        );
      }

      const response: GetRepliesResponse = {
        replies: repliesWithTagsAndProfilePictureAndRating,
        totalRepliesAfter: totalRepliesAfter,
        cursor: {
          before: repliesWithTagsAndProfilePictureAndRating.at(0)?.commentId,
          after: repliesWithTagsAndProfilePictureAndRating.at(-1)?.commentId
        }
      };
      res.status(200).json(response);
    }
  )
);

// Create a comment
router.post(
  '/:spotId',
  rateLimiter.createCommentLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      // You must have an account to make a comment
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }
      const userId = req.user.userId;

      // You must be verified to make a comment
      if (!req.user.verifiedAt) {
        return next(new authenticationError.VerifyError());
      }

      if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
        return next(new commentError.AddComment());
      }

      singleUpload(req, res, async (error: any) => {
        // There was an error uploading the image
        if (error) {
          return next(new commentError.CommentImage(422));
        }

        const body: CreateCommentRequest = JSON.parse(req.body.json);
        body.spotId = req.params.spotId.toString();
        // Location is defined on the multers3 file type
        // @ts-ignore
        const imageSrc: string = req.file ? req.file.location : null;
        // @ts-ignore
        const commentId = req.file?.key.split('/').at(-1) || uuidv4();

        // Check you are in range of the spot
        const inRange = await commentService.userInRangeForComment(
          body.spotId,
          body.location.latitude,
          body.location.longitude
        );
        if (!inRange) {
          return next(new commentError.NotInRange());
        }

        // check if line length matches
        if (
          body.content.split(/\r\n|\r|\n/).length >
          COMMENT_CONSTANTS.MAX_LINE_LENGTH
        ) {
          return next(
            new commentError.InvalidCommentLineLength(
              400,
              COMMENT_CONSTANTS.MAX_LINE_LENGTH
            )
          );
        }

        // You must either have some text or an image
        if (
          body.content.length === 0 &&
          !imageSrc &&
          body.tagsList.length === 0
        ) {
          return next(new commentError.NoCommentContent());
        }

        const contentError = commentService.validCommentContent(body.content);
        if (contentError) {
          return next(contentError);
        }

        const link = await commentService.generateCommentLink();
        let imageNsfw = false;
        if (config.testNsfwLocal && imageSrc) {
          try {
            imageNsfw = await imageService.predictNsfwLocal(imageSrc);
          } catch (err) {
            // err
          }
        }

        const createdComment = await prismaComment.createComment(
          commentId,
          body.spotId,
          userId,
          body.content,
          imageSrc,
          imageNsfw,
          link
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
                  prismaComment.updateNsfw(createdComment.commentId, isNsfw);
                }
              }
            });
        }

        // Create notifications and tag in tables
        for (let index = 0; index < body.tagsList.length; index++) {
          const taggedUser = await prismaUser.findUserByUsername(
            body.tagsList[index].username || ''
          );
          if (!taggedUser) {
            return next(new commentError.AddComment());
          }
          await prismaCommentTag.createTag(
            taggedUser.userId,
            userId,
            createdComment.spotId,
            createdComment.commentId,
            createdComment.parentCommentId || undefined,
            Math.min(body.tagsList[index].offset, body.content.length)
          );
          await prismaNotification.createNotification(
            userId,
            taggedUser.userId,
            body.content,
            NotificationType.TAG,
            createdComment.spotId,
            createdComment.commentId
          );
        }

        const spot = await prismaSpot.findSpotById(createdComment.spotId);
        if (!spot) {
          return next(new commentError.AddComment());
        }

        const createdCommentWithTags = await commentService.addTagsToComments(
          [createdComment],
          req.user?.userId
        );
        const createdCommentWithTagsAndProfilePicture =
          await commentService.addProfilePicturesToComments(
            createdCommentWithTags,
            spot.owner
          );

        const response: CreateCommentResponse = {
          comment: {
            ...createdCommentWithTagsAndProfilePicture[0],
            myRating: CommentRatingType.NONE,
            owned: true
          }
        };
        res.status(200).json(response);
      });
    }
  )
);

// Create a reply
router.post(
  '/:spotId/:commentId',
  rateLimiter.createCommentLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      // You must be verified to make a reply
      if (!req.user.verifiedAt) {
        return next(new authenticationError.VerifyError());
      }

      if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
        return next(new commentError.AddComment());
      }

      const userId = req.user.userId;

      singleUpload(req, res, async (err: any) => {
        if (err) {
          return next(new commentError.CommentImage(422));
        }

        const body: CreateReplyRequest = JSON.parse(req.body.json);
        body.spotId = req.params.spotId.toString();
        body.commentId = req.params.commentId.toString();
        // Location is defined on the multers3 file type
        // @ts-ignore
        const imageSrc: string = req.file ? req.file.location : null;
        // @ts-ignore
        const replyId = req.file?.key.split('/').at(-1) || uuidv4();

        // Check you are either in range, or were tagged in the comment chain
        const inRange = await commentService.userInRangeForComment(
          body.spotId,
          body.location.latitude,
          body.location.longitude
        );
        const isTagged = await prismaCommentTag.taggedInCommentChain(
          body.commentId,
          userId
        );
        if (!inRange && !isTagged) {
          return next(new commentError.NotTagged());
        } else if (!inRange) {
          return next(new commentError.NotInRange());
        }

        // check if line length matches
        if (
          body.content.split(/\r\n|\r|\n/).length >
          COMMENT_CONSTANTS.MAX_LINE_LENGTH
        ) {
          return next(
            new commentError.InvalidCommentLineLength(
              400,
              COMMENT_CONSTANTS.MAX_LINE_LENGTH
            )
          );
        }

        // You must either have some text or an image
        if (
          body.content.length === 0 &&
          !imageSrc &&
          body.tagsList.length === 0
        ) {
          return next(new commentError.NoCommentContent());
        }

        const contentError = commentService.validCommentContent(body.content);
        if (contentError) {
          return next(contentError);
        }

        const link = await commentService.generateCommentLink();
        let imageNsfw = false;
        if (config.testNsfwLocal && imageSrc) {
          try {
            imageNsfw = await imageService.predictNsfwLocal(imageSrc);
          } catch (err) {
            // err
          }
        }

        const createdReply = await prismaComment.createReply(
          replyId,
          body.spotId,
          userId,
          body.commentId,
          body.content,
          imageSrc,
          imageNsfw,
          link
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
                  prismaComment.updateNsfw(createdReply.commentId, isNsfw);
                }
              }
            });
        }

        // Create notifications and tag in tables
        for (let index = 0; index < body.tagsList.length; index++) {
          const taggedUser = await prismaUser.findUserByUsername(
            body.tagsList[index].username || ''
          );
          if (!taggedUser) {
            return next(new commentError.AddComment());
          }
          await prismaCommentTag.createTag(
            taggedUser.userId,
            userId,
            createdReply.spotId,
            createdReply.commentId,
            createdReply.parentCommentId || undefined,
            Math.min(body.tagsList[index].offset, body.content.length)
          );
          await prismaNotification.createNotification(
            userId,
            taggedUser.userId,
            body.content,
            NotificationType.TAG,
            createdReply.spotId,
            createdReply.commentId
          );
        }

        const spot = await prismaSpot.findSpotById(createdReply.spotId);
        if (!spot) {
          return next(new commentError.AddComment());
        }

        const createdReplyWithTags = await commentService.addTagsToComments(
          [createdReply],
          req.user?.userId
        );
        const createdReplyWithTagsAndProfilePicture =
          await commentService.addProfilePicturesToComments(
            createdReplyWithTags,
            spot.owner
          );

        const response: CreateReplyResponse = {
          reply: {
            ...createdReplyWithTagsAndProfilePicture[0],
            myRating: CommentRatingType.NONE,
            owned: true
          }
        };
        res.status(200).json(response);
      });
    }
  )
);

// Delete a comment
router.delete(
  '/:spotId/:commentId',
  rateLimiter.genericCommentLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
        return next(new commentError.DeleteComment());
      }

      const request: DeleteCommentRequest = {
        spotId: req.params.spotId,
        commentId: req.params.commentId
      };

      const commentOwned = await prismaComment.userOwnsComment(
        req.user.userId,
        request.commentId
      );
      if (
        commentOwned ||
        authorizationService.checkUserHasRole(req.user, [
          UserRole.OWNER,
          UserRole.ADMIN
        ])
      ) {
        const deletedComment = await prismaComment.softDeleteComment(
          request.commentId
        );
        if (!deletedComment) {
          return next(new commentError.DeleteComment());
        }
        await prismaComment.softDeleteReplyByParentId(request.commentId);

        const response: DeleteCommentResponse = {};
        res.status(200).json(response);
      } else {
        return next(new commentError.DeleteComment());
      }
    }
  )
);

// Delete a reply
router.delete(
  '/:spotId/:commentId/:replyId',
  rateLimiter.genericCommentLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
        return next(new commentError.DeleteReply());
      }

      const request: DeleteReplyRequest = {
        spotId: req.params.spotId,
        commentId: req.params.commentId,
        replyId: req.params.replyId
      };

      const replyOwned = await prismaComment.userOwnsComment(
        req.user.userId,
        request.replyId
      );
      if (
        replyOwned ||
        authorizationService.checkUserHasRole(req.user, [
          UserRole.OWNER,
          UserRole.ADMIN
        ])
      ) {
        const deletedReply = await prismaComment.softDeleteComment(
          request.replyId
        );
        if (!deletedReply) {
          return next(new commentError.DeleteReply());
        }

        const response: DeleteReplyResponse = {};
        res.status(200).json(response);
      } else {
        return next(new commentError.DeleteReply());
      }
    }
  )
);

// Rate a comment
router.put(
  '/:spotId/:commentId/:rating',
  rateLimiter.genericCommentLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
        return next(new commentError.RateComment());
      }

      let commentRating: CommentRatingType;
      if (req.params.rating === 'LIKE') {
        commentRating = CommentRatingType.LIKE;
      } else if (req.params.rating === 'DISLIKE') {
        commentRating = CommentRatingType.DISLIKE;
      } else if (req.params.rating === 'NONE') {
        commentRating = CommentRatingType.NONE;
      } else {
        commentRating = CommentRatingType.NONE;
      }

      const params: RateCommentRequest = {
        spotId: req.params.spotId,
        commentId: req.params.commentId,
        rating: commentRating
      };

      if (commentRating == CommentRatingType.NONE) {
        await prismaCommentRating.deleteRating(
          req.user.userId,
          params.commentId
        );
      } else {
        await prismaCommentRating.rateComment(
          req.user.userId,
          params.commentId,
          params.rating
        );
      }

      const response: RateCommentResponse = {};
      res.status(200).json(response);
    }
  )
);

// Rate a reply
router.put(
  '/:spotId/:commentId/:replyId/:rating',
  rateLimiter.genericCommentLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
        return next(new commentError.RateReply());
      }

      let commentRating: CommentRatingType;
      if (req.params.rating === 'LIKE') {
        commentRating = CommentRatingType.LIKE;
      } else if (req.params.rating === 'DISLIKE') {
        commentRating = CommentRatingType.DISLIKE;
      } else if (req.params.rating === 'NONE') {
        commentRating = CommentRatingType.NONE;
      } else {
        commentRating = CommentRatingType.NONE;
      }

      const params: RateReplyRequest = {
        spotId: req.params.spotId,
        commentId: req.params.commentId,
        replyId: req.params.replyId,
        rating: commentRating
      };

      if (commentRating == CommentRatingType.NONE) {
        await prismaCommentRating.deleteRating(req.user.userId, params.replyId);
      } else {
        await prismaCommentRating.rateComment(
          req.user.userId,
          params.replyId,
          params.rating
        );
      }

      const response: RateReplyResponse = {};
      res.status(200).json(response);
    }
  )
);

// Report a comment
router.put(
  '/:spotId/:commentId/report',
  rateLimiter.genericCommentLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new authenticationError.AuthenticationError());
      }

      if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
        return next(new commentError.ReportComment());
      }

      let reportCategory: ReportCategory;
      switch (req.body.category) {
        case ReportCategory.OFFENSIVE:
          reportCategory = ReportCategory.OFFENSIVE;
          break;
        case ReportCategory.HATE:
          reportCategory = ReportCategory.HATE;
          break;
        case ReportCategory.MATURE:
          reportCategory = ReportCategory.MATURE;
          break;
        case ReportCategory.OTHER:
          reportCategory = ReportCategory.OTHER;
          break;
        default:
          reportCategory = ReportCategory.OFFENSIVE;
      }

      const request: ReportCommentRequest = {
        spotId: req.params.spotId,
        commentId: req.params.commentId,
        content: req.body.content,
        category: reportCategory
      };

      if (
        request.content.length < REPORT_CONSTANTS.MIN_CONTENT_LENGTH ||
        request.content.length > REPORT_CONSTANTS.MAX_CONTENT_LENGTH
      ) {
        return next(
          new reportError.ReportLengthError(
            400,
            REPORT_CONSTANTS.MIN_CONTENT_LENGTH,
            REPORT_CONSTANTS.MAX_CONTENT_LENGTH
          )
        );
      }

      const report = await prismaReport.createCommentReport(
        request.spotId,
        request.commentId,
        req.user.userId,
        request.content,
        request.category
      );
      if (!report) {
        return next(new reportError.ReportError());
      }

      const response: ReportCommentResponse = {};
      res.status(200).send(response);
    }
  )
);

export default router;
