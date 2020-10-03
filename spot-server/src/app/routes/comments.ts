const express = require('express');
const router = express.Router();
const uuid = require('uuid');

// db
const posts = require('../db/posts');
const reports = require('../db/reports');
const comments = require('../db/comments');
const accounts = require('../db/accounts');
const tags = require('../db/tags');
const notifications = require('../db/notifications');

// services
const commentsService = require('../services/comments');

// errors
const CommentsError = require('@exceptions/comments');
const AuthenticationError = require('@exceptions/authentication');
const ErrorHandler = require('@src/app/errorHandler');

// image
const upload = require('../services/image');
const singleUpload = upload.single('image');

// constants
const comments_constants = require('@constants/comments');
const COMMENTS_CONSTANTS = comments_constants.COMMENTS_CONSTANTS;

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// Get comment activity
router.get('/activity', function (req: any, res: any, next: any) {

    // You must have an account to make a comment
    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const accountId = req.user.id;
    const date = req.query.date;
    const limit = Number(req.query.limit);

    comments.getCommentsActivity(accountId, date, limit).then(ErrorHandler.catchAsync(async (activities: any) => {

        for (let i = 0; i < activities.length; i++) {
            try {
                activities[i].content = await commentsService.addTagsToContent( activities[i].id, accountId, activities[i].account_id, activities[i].content);
            } catch (err) {
                console.log('err1', err)
                return next(new CommentsError.CommentActivity(500));
            }
        }

        const response = { activity: activities };
        res.status(200).json(response);

    }, (err: any) => {
        console.log('err2', err)
        return next(new CommentsError.CommentActivity(500));
    }));

});

// Get all comments for a post
router.get('/:postId', ErrorHandler.catchAsync( async function (req: any, res: any, next: any) {
    
    const postId = req.params.postId;

    const commentLink = req.query.comment;
    let date = req.query.date;
    let type = req.query.type;
    let limit = Number(req.query.limit);

    // If comment id given, get that comment, then get limit-1 posts after that time stamp
    // otherwise get limit timestamps from the given date

    // Type means get before the date or after the date LIMIT #

    // TYPE CAHNGES THE SQL SORT ASC / DESC

    let commentsArray: any[] = []

    // If given a commentId we fetch that comment and everything after
    if ( commentLink ) {
        await comments.getCommentByLink( commentLink , req.authenticated ? req.user.id : null ).then( (rows: any) => {
            date = rows[0].creation_date;
            type = 'before';
            limit = limit -= 1 || 0;
            commentsArray = commentsArray.concat(rows)
        });
    }

    comments.getCommentByPostId(postId, date, limit, type, req.authenticated ? req.user.id : null).then( async (rows: any) => {

        commentsArray = commentsArray.concat(rows)

        try {
            await commentsService.getTags( commentsArray, req.authenticated ? req.user.id : null ).then( (taggedComments: any) => {
                commentsArray = taggedComments;
            });
        } catch (err) {
            return next(new CommentsError.GetComments(500));
        }

        let numCommentsBefore = 0;
        let numCommentsAfter = 0;
        if ( type == 'before' ) {
          if ( commentsArray.length > 0 ) {
            const lastDate = commentsArray[commentsArray.length-1].creation_date;
            await comments.getNumberOfCommentsForPostBeforeDate(postId, lastDate).then( (num: any) => {
              numCommentsBefore = num[0].total
            }, (err: any) => {
                return next(new CommentsError.GetComments(500));
            });
            const firstDate = commentsArray[0].creation_date;
            await comments.getNumberOfCommentsForPostAfterDate(postId, firstDate).then( (num: any) => {
                numCommentsAfter = num[0].total
              }, (err: any) => {
                  return next(new CommentsError.GetComments(500));
              });
          }
        }

        await posts.getPostCreator(postId).then( async (postCreator: any) => {
            await commentsService.addProfilePicture(commentsArray, postCreator[0].account_id).then( (a: any) => {
                commentsArray = a;
            });
        }, (err: any) => {
            return next(new CommentsError.GetComments(500));
        });

        const response = { 
            postId: postId,
            comments: commentsArray,
            totalCommentsBefore: numCommentsBefore,
            totalCommentsAfter: numCommentsAfter,
            type: type 
        };
        res.status(200).json(response);
        
    }, (err: any) => {
        return next(new CommentsError.GetComments(500));
    });

}));

// Get all replies for a comment on a post
router.get('/:postId/:commentId', function (req: any, res: any, next: any) {
    
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const date = req.query.date || null;
    const limit = Number(req.query.limit);

    comments.getRepliesByCommentId(postId, commentId, date, limit, req.authenticated ? req.user.id : null).then( ErrorHandler.catchAsync(async (rows: any) => {

        await commentsService.getTags( rows, req.authenticated ? req.user.id : null ).then( (taggedComments: any) => {
            rows = taggedComments;
        });

        comments.getNumberOfRepliesForComment(postId, commentId).then( ( num: any) => {
            posts.getPostCreator(postId).then( ErrorHandler.catchAsync(async (postCreator: any) => {
                await commentsService.addProfilePicture(rows, postCreator[0].account_id);
                res.status(200).json({ postId: postId, commentId: commentId, replies: rows, totalReplies: num[0].total });
            }, (err: any) => {
                return next(new CommentsError.GetReplies(500));
            }));
        }, (err: any) => {
            return next(new CommentsError.GetReplies(500));
        });
    }, (err: any) => {
        return next(new CommentsError.GetReplies(500));
    }));
});

// Create a comment
router.post('/:postId', ErrorHandler.catchAsync( async (req: any, res: any, next: any) => {

    // You must have an account to make a comment
    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const accountId = req.user.id;
    const commentId = uuid.v4();
    req.filename = 'comments/' + Date.now().toString();

    singleUpload(req, res, ErrorHandler.catchAsync(async function(err: any) {

        if (err) {
            return next(new CommentsError.CommentImage(422));
        }

        let { content, tagsList, commentParentId } = JSON.parse(req.body.json)
        const image = req.file ? req.file.location: null

        // TODO: If we were to cleanup whitespace. here

        // check if line length matches
        if ( content.split(/\r\n|\r|\n/).length > COMMENTS_CONSTANTS.MAX_LINE_LENGTH ) {
            return next(new CommentsError.InvalidCommentLineLength(400, COMMENTS_CONSTANTS.MAX_LINE_LENGTH))
        }

        // You must either have some text or an image
        if ( content.length == 0 && !image && tagsList.length === 0 ) {
            return next(new CommentsError.NoCommentContent(400));
        }

        const contentError = commentsService.validContent(content);
        if ( contentError ) {
            return next(contentError);
        }

        const postId = req.params.postId;

        const link = await commentsService.generateLink();

        comments.addComment(commentId, postId, accountId, content, image, link, commentParentId).then( async (comment: any) => {

            // Add tags and send notifications
            for ( let index = 0; index < tagsList.length; index++ ) {
    
                await accounts.getAccountByUsername(tagsList[index].username).then( ErrorHandler.catchAsync(async (account: any) => {
                    await tags.addTag( account[0].id, comment[0].id, Math.min(tagsList[index].offset, content.length) );
                    await notifications.addCommentNotification( comment[0].account_id, account[0].id, comment[0].post_id, comment[0].id );
                }, (err: any) => {
                    return next(new CommentsError.AddComment(500));
                }));
    
            }
    
            // Add tags to our comment
            await commentsService.getTags( comment, accountId ).then( (taggedComments: any) => {
                comment = taggedComments;
            }, (err: any) => {
                return next(new CommentsError.AddComment(500));
            });
    
            // Add profile picture and send
            posts.getPostCreator(postId).then( ErrorHandler.catchAsync(async (postCreator: any) => {
                await commentsService.addProfilePicture(comment, postCreator[0].account_id);
                res.status(200).json({ postId: postId, comment: comment[0] } );
            }, (err: any) => {
                return next(new CommentsError.AddComment(500));
            }));

        }, (err: any) => {
            return next(new CommentsError.AddComment(500));
        });

    }));

}));

// Create a reply
router.post('/:postId/:commentId', ErrorHandler.catchAsync( async function (req: any, res: any, next: any) {

    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const accountId = req.user.id;
    const replyId = uuid.v4();
    req.filename = 'replies/' + Date.now().toString();

    singleUpload(req, res, async function(err: any) {

        if (err) {
            return next(new CommentsError.CommentImage(422));
        }

        const { content, tagsList, commentParentId } = JSON.parse(req.body.json);
        const image = req.file ? req.file.location: null;

        const postId = req.params.postId;
        const commentId = req.params.commentId;
        const link = await commentsService.generateLink();

        comments.addReply(replyId, postId, commentId, commentParentId, accountId, content, image, link).then( ErrorHandler.catchAsync(async (reply: any) => {

            // TODO: add catches for these

            // Add tags
            for ( let index = 0; index < tagsList.length; index++ ) {
                await accounts.getAccountByUsername(tagsList[index].username).then( async (account: any) => {
                    await tags.addTag( account[0].id, reply[0].id, Math.min(tagsList[index].offset, content.length) );
                    await notifications.addReplyNotification( reply[0].account_id, account[0].id, reply[0].post_id, reply[0].parent_id, reply[0].id );
                });
            }

            await commentsService.getTags( reply, accountId ).then( (taggedComments: any) => {
                reply = taggedComments;
            });
    
            posts.getPostCreator(postId).then( async (postCreator: any) => {
                await commentsService.addProfilePicture(reply, postCreator[0].account_id);
                const response = {
                    postId: postId,
                    commentId: commentId,
                    reply: reply[0]
                };
                res.status(200).json(response);
            }, (err: any) => {
                return next(new CommentsError.AddComment(500));
            });
    
        }, (err: any) => {
            return next(new CommentsError.AddComment(500));
        }));

    });

}));

// Delete a comment
router.delete('/:postId/:commentId', function (req: any, res: any, next: any) {

    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.deleteCommentById(commentId, accountId).then( (rows: any) => {
        const response = { postId: postId, commentId: commentId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new CommentsError.DeleteComment(500));
    });

});

// Delete a reply
router.delete('/:postId/:parentId/:commentId', function (req: any, res: any, next: any) {

    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const postId = req.params.postId;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.deleteCommentById(commentId, accountId).then( (rows: any) => {
        const response = { postId: postId, parentId: parentId, commentId: commentId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new CommentsError.DeleteReply(500));
    });

});

// Like a comment
router.put('/:postId/:commentId/like', function(req: any, res: any, next: any) {

    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.likeComment(commentId, accountId).then((rows: any) => {
        const response = { postId: postId, commentId: commentId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new CommentsError.LikeComment(500));
    });

});

// Dislike a comment
router.put('/:postId/:commentId/dislike', function(req: any, res: any, next: any) {

    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.dislikeComment(commentId, accountId).then((rows: any) => {
        const response = { postId: postId, commentId: commentId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new CommentsError.DislikeComment(500));
    });

});

// remove like / dislike from comment
router.put('/:postId/:commentId/unrated', function(req: any, res: any, next: any) {

    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.unratedComment(commentId, accountId).then((rows: any) => {
        const response = { postId: postId, commentId: commentId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new CommentsError.UnratedComment(500));
    });

});

// Like a reply
router.put('/:postId/:parentId/:commentId/like', function(req: any, res: any, next: any) {

    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const postId = req.params.postId;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.likeComment(commentId, accountId).then((rows: any) => {
        const response = { postId: postId, parentId: parentId, commentId: commentId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new CommentsError.LikeReply(500));
    });

});

// Dislike a reply
router.put('/:postId/:parentId/:commentId/dislike', function(req: any, res: any, next: any) {

    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const postId = req.params.postId;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.dislikeComment(commentId, accountId).then((rows: any) => {
        const response = { postId: postId, parentId: parentId, commentId: commentId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new CommentsError.DislikeReply(500));
    });

});

// remove like / dislike from reply
router.put('/:postId/:parentId/:commentId/unrated', function(req: any, res: any, next: any) {

    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const postId = req.params.postId;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.unratedComment(commentId, accountId).then((rows: any) => {
        const response = { postId: postId, parentId: parentId, commentId: commentId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new CommentsError.UnratedComment(500));
    });

});

// Report a comment
router.put('/:postId/:commentId/report', function(req: any, res: any, next: any) {

    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;
    const { content } = req.body;

    reports.addCommentReport( postId, commentId, accountId, content ).then((rows: any) => {
        res.status(200).send({});
    }, (err: any) => {
        return next(new CommentsError.ReportComment(500));
    });

});

export = router;
