import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

import uuid from 'uuid';

// db
import posts from '@db/posts.js';
import reports from '@db/reports.js';
import comments from '@db/comments.js';
import accounts from '@db/accounts.js';
import tags from '@db/tags.js';
import notifications from '@db/notifications.js';
import prismaSpot from '@db/../prisma/spot.js';
import prismaReport from '@db/../prisma/report.js';
import prismaComment from '@db/../prisma/comment.js';
import prismaCommentTag from '@db/../prisma/commentTag.js';
import prismaNotification from '@db/../prisma/notification.js';

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
import ErrorHandler from '@helpers/errorHandler.js';

// constants
import { COMMENT_CONSTANTS } from '@constants/comment.js';

// config
import config from '@config/config.js';

// models
import { UserRole } from '@models/../newModels/user.js';
import {
  Comment,
  CommentActivity,
  GetCommentsRequest,
  GetCommentsResponse,
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
  GetCommentActivityResponse
} from '@models/../newModels/comment.js';

router.use((req: Request, res: Response, next: NextFunction) => {
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
        before: req.query.before
          ? new Date(req.query.before.toString())
          : undefined,
        after: req.query.after
          ? new Date(req.query.after.toString())
          : undefined,
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

      const response: GetCommentActivityResponse = {
        activity: commentActivityWithTags,
        cursor: {
          before: commentActivityWithTags.at(0)?.createdAt,
          after: commentActivityWithTags.at(-1)?.createdAt
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
        after: req.query?.before?.toString()
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
        request.limit,
        req.user?.userId
      );
      commentsArray = commentsArray.concat(comments);

      const commentsWithTags = await commentService.addTagsToComments(
        commentsArray,
        req.user?.userId
      );

      const totalCommentsBefore =
        await prismaComment.findTotalCommentsBeforeDate(
          request.spotId,
          commentsWithTags.at(-1)?.createdAt
        );
      const totalCommentsAfter = await prismaComment.findTotalCommentsAfterDate(
        request.spotId,
        commentsWithTags.at(0)?.createdAt
      );

      const spot = await prismaSpot.findSpotById(request.spotId);
      if (!spot) {
          return next(new commentError.GetComments());
      }

      const commentsWithTagsAndProfilePicture =
        await commentService.addProfilePicturesToComments(commentsWithTags, spot.spotId);

      const response: GetCommentsResponse = {
        spotId: request.spotId,
        comments: commentsWithTagsAndProfilePicture,
        totalCommentsBefore: totalCommentsBefore,
        totalCommentsAfter: totalCommentsAfter,
        cursor: {
          before: commentsWithTagsAndProfilePicture.at(0)?.commentId,
          after: commentsWithTagsAndProfilePicture.at(-1)?.commentId
        }
      };
      res.status(200).json(response);
    }
  )
);

// Get all replies for a comment on a post
router.get(
  '/:postId/:commentId',
  ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const replyLink = req.query.reply;
    const date = req.query.date || null;
    const limit = Number(req.query.limit);

    let replies: any;

    if (replyLink) {
      try {
        const comment = await comments.getCommentByLink(
          replyLink,
          req.user ? req.user.id : null
        );
        if (comment.length < 1) {
          return next(new CommentsError.GetReplies(500));
        }

        // If its a reply, get all replies up to this comment, otherwise get replies normally
        if (comment[0].parent_id == commentId) {
          // its a reply
          replies = await comments.getRepliesUpToDate(
            postId,
            commentId,
            comment[0].creation_date,
            req.user ? req.user.id : null
          );
        } else {
          replies = await comments.getRepliesByCommentId(
            postId,
            commentId,
            date,
            limit,
            req.user ? req.user.id : null
          );
        }
      } catch (err) {
        return next(new CommentsError.GetReplies(500));
      }
    } else {
      replies = await comments.getRepliesByCommentId(
        postId,
        commentId,
        date,
        limit,
        req.user ? req.user.id : null
      );
    }

    await commentsService
      .getTags(replies, req.user ? req.user.id : null)
      .then((taggedComments: any) => {
        replies = taggedComments;
      });

    const lastDate =
      replies.length > 0 ? replies[replies.length - 1].creation_date : null;
    comments
      .getNumberOfRepliesForCommentAfterDate(postId, commentId, lastDate)
      .then(
        (num: any) => {
          posts.getPostCreator(postId).then(
            async (postCreator: any) => {
              await commentsService.addProfilePicture(
                replies,
                postCreator[0].account_id
              );
              const response = {
                postId: postId,
                commentId: commentId,
                replies: replies,
                totalRepliesAfter: num[0].total
              };
              res.status(200).json(response);
            },
            (err: any) => {
              return next(new CommentsError.GetReplies(500));
            }
          );
        },
        (err: any) => {
          return next(new CommentsError.GetReplies(500));
        }
      );
  })
);

// Create a comment
router.post(
  '/:postId',
  rateLimiter.createCommentLimiter,
  ErrorHandler.catchAsync(async (req: any, res: any, next: any) => {
    // You must have an account to make a comment
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    // You must be verified to make a comment
    if (!req.user.verifiedAt) {
      return next(new AuthenticationError.VerifyError(400));
    }

    if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
      return next(new CommentsError.AddComment(500));
    }

    const accountId = req.user.id;
    const commentId = uuid.v4();
    req.filename = commentId;

    singleUpload(req, res, async function (error: any) {
      // There was an error uploading the image
      if (error) {
        return next(new CommentsError.CommentImage(422));
      }

      const { content, tagsList, location } = JSON.parse(req.body.json);
      const image = req.file ? req.file.location : null;
      const postId = req.params.postId;

      // Check you are in range of the post
      const inRange = await commentsService.inRange(
        postId,
        location.latitude,
        location.longitude
      );
      if (!inRange) {
        return next(new CommentsError.NotInRange(400));
      }

      // check if line length matches
      if (
        content.split(/\r\n|\r|\n/).length > COMMENTS_CONSTANTS.MAX_LINE_LENGTH
      ) {
        return next(
          new CommentsError.InvalidCommentLineLength(
            400,
            COMMENTS_CONSTANTS.MAX_LINE_LENGTH
          )
        );
      }

      // You must either have some text or an image
      if (content.length === 0 && !image && tagsList.length === 0) {
        return next(new CommentsError.NoCommentContent(400));
      }

      const contentError = commentsService.validContent(content);
      if (contentError) {
        return next(contentError);
      }

      const link = await commentsService.generateLink();
      let imageNsfw = false;
      if (config.testNsfwLocal && image) {
        try {
          imageNsfw = await imageService.predictNsfwLocal(image);
        } catch (err) {
          // err
        }
      }

      comments
        .addComment(
          commentId,
          postId,
          accountId,
          content,
          image,
          imageNsfw,
          link,
          commentId
        )
        .then(
          async (comment: any) => {
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
                        comments.updateNsfw(commentId, isNsfw);
                      }
                    }
                  }
                },
                (err: any) => {}
              );
            }

            // Add tags and send notifications
            for (let index = 0; index < tagsList.length; index++) {
              try {
                const account = await accounts.getAccountByUsername(
                  tagsList[index].username
                );
                await tags.addTag(
                  account[0].id,
                  comment[0].id,
                  Math.min(tagsList[index].offset, content.length)
                );
                await notifications.addCommentNotification(
                  accountId,
                  account[0].id,
                  comment[0].post_id,
                  comment[0].id
                );
              } catch (err) {
                return next(new CommentsError.AddComment(500));
              }
            }

            // Add tags to our comment
            await commentsService.getTags(comment, accountId).then(
              (taggedComments: any) => {
                comment = taggedComments;
              },
              (err: any) => {
                return next(new CommentsError.AddComment(500));
              }
            );

            // Add profile picture and send
            posts.getPostCreator(postId).then(
              async (postCreator: any) => {
                await commentsService.addProfilePicture(
                  comment,
                  postCreator[0].account_id
                );
                res.status(200).json({ postId: postId, comment: comment[0] });
              },
              (err: any) => {
                return next(new CommentsError.AddComment(500));
              }
            );
          },
          (err: any) => {
            return next(new CommentsError.AddComment(500));
          }
        );
    });
  })
);

// Create a reply
router.post(
  '/:postId/:commentId',
  rateLimiter.createCommentLimiter,
  ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    // You must be verified to make a reply
    if (!req.user.verifiedAt) {
      return next(new AuthenticationError.VerifyError(400));
    }

    if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
      return next(new CommentsError.AddComment(500));
    }

    const accountId = req.user.id;
    const replyId = uuid.v4();
    req.filename = replyId;

    singleUpload(req, res, async function (err: any) {
      if (err) {
        return next(new CommentsError.CommentImage(422));
      }

      const { content, tagsList, commentParentId, location } = JSON.parse(
        req.body.json
      );
      const image = req.file ? req.file.location : null;

      const postId = req.params.postId;
      const commentId = req.params.commentId;

      // Check you are either in range, or were tagged in the comment chain
      const inRange = await commentsService.inRange(
        postId,
        location.latitude,
        location.longitude
      );
      const isTagged = await tags.TaggedInCommentChain(
        commentParentId,
        accountId
      );
      if (!inRange && !isTagged) {
        return next(new CommentsError.NotTagged(400));
      } else if (!inRange) {
        return next(new CommentsError.NotInRange(400));
      }

      // check if line length matches
      if (
        content.split(/\r\n|\r|\n/).length > COMMENTS_CONSTANTS.MAX_LINE_LENGTH
      ) {
        return next(
          new CommentsError.InvalidCommentLineLength(
            400,
            COMMENTS_CONSTANTS.MAX_LINE_LENGTH
          )
        );
      }

      // You must either have some text or an image
      if (content.length === 0 && !image && tagsList.length === 0) {
        return next(new CommentsError.NoCommentContent(400));
      }

      const contentError = commentsService.validContent(content);
      if (contentError) {
        return next(contentError);
      }

      const link = await commentsService.generateLink();
      let imageNsfw = false;
      if (config.testNsfwLocal && image) {
        try {
          imageNsfw = await imageService.predictNsfwLocal(image);
        } catch (err) {
          // err
        }
      }

      comments
        .addReply(
          replyId,
          postId,
          commentId,
          commentParentId,
          accountId,
          content,
          image,
          imageNsfw,
          link
        )
        .then(
          async (reply: any) => {
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
                        comments.updateNsfw(replyId, isNsfw);
                      }
                    }
                  }
                },
                (err: any) => {}
              );
            }

            // Add tags
            for (let index = 0; index < tagsList.length; index++) {
              try {
                const account = await accounts.getAccountByUsername(
                  tagsList[index].username
                );
                await tags.addTag(
                  account[0].id,
                  reply[0].id,
                  Math.min(tagsList[index].offset, content.length)
                );
                await notifications.addReplyNotification(
                  accountId,
                  account[0].id,
                  reply[0].post_id,
                  reply[0].parent_id,
                  reply[0].id
                );
              } catch (err) {
                return next(new CommentsError.AddComment(500));
              }
            }

            // add tags to content
            await commentsService
              .getTags(reply, accountId)
              .then((taggedComments: any) => {
                reply = taggedComments;
              });

            posts.getPostCreator(postId).then(
              async (postCreator: any) => {
                await commentsService.addProfilePicture(
                  reply,
                  postCreator[0].account_id
                );
                const response = {
                  postId: postId,
                  commentId: commentId,
                  reply: reply[0]
                };
                res.status(200).json(response);
              },
              (err: any) => {
                return next(new CommentsError.AddComment(500));
              }
            );
          },
          (err: any) => {
            return next(new CommentsError.AddComment(500));
          }
        );
    });
  })
);

// Delete a comment
router.delete(
  '/:postId/:commentId',
  rateLimiter.genericCommentLimiter,
  function (req: any, res: any, next: any) {
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
      return next(new CommentsError.DeleteComment(500));
    }

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.checkOwned(postId, accountId).then(
      (owned: boolean) => {
        if (
          owned ||
          authorizationService.checkUserHasRole(req.user, [
            UserRole.OWNER,
            UserRole.ADMIN
          ])
        ) {
          comments.deleteCommentById(commentId).then(
            (rows: any) => {
              comments.deleteReplyByParentId(commentId).then(
                (rows: any) => {
                  const response = { postId: postId, commentId: commentId };
                  res.status(200).json(response);
                },
                (err: any) => {
                  return next(new CommentsError.DeleteComment(500));
                }
              );
            },
            (err: any) => {
              return next(new CommentsError.DeleteComment(500));
            }
          );
        } else {
          return next(new CommentsError.DeleteComment(500));
        }
      },
      (err: any) => {
        return next(new CommentsError.DeleteComment(500));
      }
    );
  }
);

// Delete a reply
router.delete(
  '/:postId/:parentId/:commentId',
  rateLimiter.genericCommentLimiter,
  function (req: any, res: any, next: any) {
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
      return next(new CommentsError.DeleteReply(500));
    }

    const postId = req.params.postId;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.checkOwned(postId, accountId).then(
      (owned: boolean) => {
        if (
          owned ||
          authorizationService.checkUserHasRole(req.user, [
            UserRole.OWNER,
            UserRole.ADMIN
          ])
        ) {
          comments.deleteCommentById(commentId).then(
            (rows: any) => {
              const response = {
                postId: postId,
                parentId: parentId,
                commentId: commentId
              };
              res.status(200).json(response);
            },
            (err: any) => {
              return next(new CommentsError.DeleteReply(500));
            }
          );
        } else {
          return next(new CommentsError.DeleteReply(500));
        }
      },
      (err: any) => {
        return next(new CommentsError.DeleteReply(500));
      }
    );
  }
);

// Like a comment
router.put(
  '/:postId/:commentId/like',
  rateLimiter.genericCommentLimiter,
  function (req: any, res: any, next: any) {
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
      return next(new CommentsError.LikeComment(500));
    }

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.likeComment(commentId, accountId).then(
      (rows: any) => {
        const response = { postId: postId, commentId: commentId };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new CommentsError.LikeComment(500));
      }
    );
  }
);

// Dislike a comment
router.put(
  '/:postId/:commentId/dislike',
  rateLimiter.genericCommentLimiter,
  function (req: any, res: any, next: any) {
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
      return next(new CommentsError.DislikeComment(500));
    }

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.dislikeComment(commentId, accountId).then(
      (rows: any) => {
        const response = { postId: postId, commentId: commentId };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new CommentsError.DislikeComment(500));
      }
    );
  }
);

// remove like / dislike from comment
router.put(
  '/:postId/:commentId/unrated',
  rateLimiter.genericCommentLimiter,
  function (req: any, res: any, next: any) {
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
      return next(new CommentsError.UnratedComment(500));
    }

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.unratedComment(commentId, accountId).then(
      (rows: any) => {
        const response = { postId: postId, commentId: commentId };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new CommentsError.UnratedComment(500));
      }
    );
  }
);

// Like a reply
router.put(
  '/:postId/:parentId/:commentId/like',
  rateLimiter.genericCommentLimiter,
  function (req: any, res: any, next: any) {
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
      return next(new CommentsError.LikeReply(500));
    }

    const postId = req.params.postId;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.likeComment(commentId, accountId).then(
      (rows: any) => {
        const response = {
          postId: postId,
          parentId: parentId,
          commentId: commentId
        };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new CommentsError.LikeReply(500));
      }
    );
  }
);

// Dislike a reply
router.put(
  '/:postId/:parentId/:commentId/dislike',
  rateLimiter.genericCommentLimiter,
  function (req: any, res: any, next: any) {
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
      return next(new CommentsError.DislikeReply(500));
    }

    const postId = req.params.postId;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.dislikeComment(commentId, accountId).then(
      (rows: any) => {
        const response = {
          postId: postId,
          parentId: parentId,
          commentId: commentId
        };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new CommentsError.DislikeReply(500));
      }
    );
  }
);

// remove like / dislike from reply
router.put(
  '/:postId/:parentId/:commentId/unrated',
  rateLimiter.genericCommentLimiter,
  function (req: any, res: any, next: any) {
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
      return next(new CommentsError.UnratedComment(500));
    }

    const postId = req.params.postId;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.unratedComment(commentId, accountId).then(
      (rows: any) => {
        const response = {
          postId: postId,
          parentId: parentId,
          commentId: commentId
        };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new CommentsError.UnratedComment(500));
      }
    );
  }
);

// Report a comment
router.put(
  '/:postId/:commentId/report',
  rateLimiter.genericCommentLimiter,
  function (req: any, res: any, next: any) {
    if (!req.user) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorizationService.checkUserHasRole(req.user, [UserRole.GUEST])) {
      return next(new CommentsError.ReportComment(500));
    }

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;
    const { content, category } = req.body;

    reports
      .addCommentReport(postId, commentId, accountId, content, category)
      .then(
        (rows: any) => {
          res.status(200).send({});
        },
        (err: any) => {
          return next(new CommentsError.ReportComment(500));
        }
      );
  }
);

export default router;
