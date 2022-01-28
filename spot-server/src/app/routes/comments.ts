const express = require('express');
const router = express.Router();

const uuid = require('uuid');

// db
const posts = require('@db/posts');
const reports = require('@db/reports');
const comments = require('@db/comments');
const accounts = require('@db/accounts');
const tags = require('@db/tags');
const notifications = require('@db/notifications');

// services
const commentsService = require('@services/comments');
const imageService = require('@services/image');
const authorization = require('@services/authorization/authorization');
const singleUpload = imageService.upload.single('image');

// ratelimiter
const rateLimiter = require('@helpers/rateLimiter');

// errors
const CommentsError = require('@exceptions/comments');
const AuthenticationError = require('@exceptions/authentication');
const ErrorHandler = require('@helpers/errorHandler');

// constants
const comments_constants = require('@constants/comments');
const COMMENTS_CONSTANTS = comments_constants.COMMENTS_CONSTANTS;
const roles = require('@services/authorization/roles');

// config
const config = require('@config/config');

router.use(function timeLog(req: any, res: any, next: any) {
  next();
});

// Get comment activity
router.get(
  '/activity',
  rateLimiter.genericCommentLimiter,
  function (req: any, res: any, next: any) {
    // You must have an account to make a comment
    if (!req.authenticated) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    const accountId = req.user.id;
    const before = req.query.before ? new Date(req.query.before) : null;
    const after = req.query.after ? new Date(req.query.after) : null;
    const limit = Number(req.query.limit);

    comments.getCommentsActivity(accountId, before, after, limit).then(
      ErrorHandler.catchAsync(
        async (activities: any) => {
          for (let i = 0; i < activities.length; i++) {
            try {
              activities[i].content = await commentsService.addTagsToContent(
                activities[i].id,
                accountId,
                activities[i].account_id,
                activities[i].content
              );
            } catch (err) {
              return next(new CommentsError.CommentActivity(500));
            }
          }
          const response = {
            activity: activities,
            size: activities.length,
            cursor: {
              before:
                activities.length > 0 ? activities[0].creation_date : null,
              after:
                activities.length > 0
                  ? activities[activities.length - 1].creation_date
                  : null
            }
          };
          res.status(200).json(response);
        },
        (err: any) => {
          return next(new CommentsError.CommentActivity(500));
        }
      )
    );
  }
);

// Get all comments for a post
router.get(
  '/:postId',
  ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {
    const postId = req.params.postId;

    const commentLink = req.query.comment;
    let date = req.query.date;
    let type = req.query.type;
    let limit = Number(req.query.limit);

    // If comment id given, get that comment, then get limit-1 posts after that time stamp
    // otherwise get limit timestamps from the given date

    // Type means get before the date or after the date LIMIT #

    // TYPE CAHNGES THE SQL SORT ASC / DESC

    let commentsArray: any[] = [];

    // If given a commentId we fetch that comment and everything after
    if (commentLink) {
      try {
        const comment = await comments.getCommentByLink(
          commentLink,
          req.authenticated ? req.user.id : null
        );
        if (comment.length < 1) {
          return next(new CommentsError.GetComments(500));
        }

        // if its a reply, get the parent creation_date
        if (comment[0].parent_id) {
          let parent;
          if (req.authenticated) {
            parent = await comments.getCommentById(
              comment[0].parent_id,
              req.user.id
            );
          } else {
            parent = await comments.getCommentByIdNoAccount(
              comment[0].parent_id
            );
          }
          date = parent[0].creation_date;
          commentsArray = commentsArray.concat(parent);
        } else {
          date = comment[0].creation_date;
          commentsArray = commentsArray.concat(comment);
        }
        type = 'before';
        limit -= 1;

        const rows = await comments.getCommentByPostId(
          postId,
          date,
          limit,
          type,
          req.authenticated ? req.user.id : null
        );
        commentsArray = commentsArray.concat(rows);
      } catch (err) {
        return next(new CommentsError.GetComments(500));
      }
    } else {
      try {
        const rows = await comments.getCommentByPostId(
          postId,
          date,
          limit,
          type,
          req.authenticated ? req.user.id : null
        );
        commentsArray = commentsArray.concat(rows);
      } catch (err) {
        return next(new CommentsError.GetComments(500));
      }
    }

    try {
      await commentsService
        .getTags(commentsArray, req.authenticated ? req.user.id : null)
        .then((taggedComments: any) => {
          commentsArray = taggedComments;
        });
    } catch (err) {
      return next(new CommentsError.GetComments(500));
    }

    let numCommentsBefore = 0;
    let numCommentsAfter = 0;
    if (type == 'before') {
      if (commentsArray.length > 0) {
        const lastDate = commentsArray[commentsArray.length - 1].creation_date;
        await comments
          .getNumberOfCommentsForPostBeforeDate(postId, lastDate)
          .then(
            (num: any) => {
              numCommentsBefore = num[0].total;
            },
            (err: any) => {
              return next(new CommentsError.GetComments(500));
            }
          );
        const firstDate = commentsArray[0].creation_date;
        await comments
          .getNumberOfCommentsForPostAfterDate(postId, firstDate)
          .then(
            (num: any) => {
              numCommentsAfter = num[0].total;
            },
            (err: any) => {
              return next(new CommentsError.GetComments(500));
            }
          );
      }
    }

    try {
      const postCreator = await posts.getPostCreator(postId);
      const a = await commentsService.addProfilePicture(
        commentsArray,
        postCreator[0].account_id
      );
      commentsArray = a;
    } catch (err) {
      return next(new CommentsError.GetComments(500));
    }

    const response = {
      postId: postId,
      comments: commentsArray,
      totalCommentsBefore: numCommentsBefore,
      totalCommentsAfter: numCommentsAfter,
      type: type
    };
    res.status(200).json(response);
  })
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
          req.authenticated ? req.user.id : null
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
            req.authenticated ? req.user.id : null
          );
        } else {
          replies = await comments.getRepliesByCommentId(
            postId,
            commentId,
            date,
            limit,
            req.authenticated ? req.user.id : null
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
        req.authenticated ? req.user.id : null
      );
    }

    await commentsService
      .getTags(replies, req.authenticated ? req.user.id : null)
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
            ErrorHandler.catchAsync(
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
            )
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
    if (!req.authenticated) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    // You must be verified to make a comment
    if (!req.verified) {
      return next(new AuthenticationError.VerifyError(400));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new CommentsError.AddComment(500));
    }

    const accountId = req.user.id;
    const commentId = uuid.v4();
    req.filename = commentId;

    singleUpload(
      req,
      res,
      ErrorHandler.catchAsync(async function (error: any) {
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
          content.split(/\r\n|\r|\n/).length >
          COMMENTS_CONSTANTS.MAX_LINE_LENGTH
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
            imageNsfw = await imageService.predictNsfw(image);
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
            ErrorHandler.catchAsync(
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
                  ErrorHandler.catchAsync(
                    async (postCreator: any) => {
                      await commentsService.addProfilePicture(
                        comment,
                        postCreator[0].account_id
                      );
                      res
                        .status(200)
                        .json({ postId: postId, comment: comment[0] });
                    },
                    (err: any) => {
                      return next(new CommentsError.AddComment(500));
                    }
                  )
                );
              },
              (err: any) => {
                return next(new CommentsError.AddComment(500));
              }
            )
          );
      })
    );
  })
);

// Create a reply
router.post(
  '/:postId/:commentId',
  rateLimiter.createCommentLimiter,
  ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {
    if (!req.authenticated) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    // You must be verified to make a reply
    if (!req.verified) {
      return next(new AuthenticationError.VerifyError(400));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new CommentsError.AddComment(500));
    }

    const accountId = req.user.id;
    const replyId = uuid.v4();
    req.filename = replyId;

    singleUpload(
      req,
      res,
      ErrorHandler.catchAsync(async function (err: any) {
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
          content.split(/\r\n|\r|\n/).length >
          COMMENTS_CONSTANTS.MAX_LINE_LENGTH
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
            imageNsfw = await imageService.predictNsfw(image);
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
            ErrorHandler.catchAsync(
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
                  ErrorHandler.catchAsync(
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
                  )
                );
              },
              (err: any) => {
                return next(new CommentsError.AddComment(500));
              }
            )
          );
      })
    );
  })
);

// Delete a comment
router.delete(
  '/:postId/:commentId',
  rateLimiter.genericCommentLimiter,
  function (req: any, res: any, next: any) {
    if (!req.authenticated) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new CommentsError.DeleteComment(500));
    }

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.checkOwned(postId, accountId).then(
      (owned: boolean) => {
        if (
          owned ||
          authorization.checkRole(req.user, [roles.owner, roles.admin])
        ) {
          comments.deleteCommentById(commentId, accountId).then(
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
    if (!req.authenticated) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
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
          authorization.checkRole(req.user, [roles.owner, roles.admin])
        ) {
          comments.deleteCommentById(commentId, accountId).then(
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
    if (!req.authenticated) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
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
    if (!req.authenticated) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
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
    if (!req.authenticated) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
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
    if (!req.authenticated) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
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
    if (!req.authenticated) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
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
    if (!req.authenticated) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
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
    if (!req.authenticated) {
      return next(new AuthenticationError.AuthenticationError(401));
    }

    if (authorization.checkRole(req.user, [roles.guest])) {
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

export = router;
