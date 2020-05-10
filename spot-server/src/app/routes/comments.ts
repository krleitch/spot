const express = require('express');
const router = express.Router();

const posts = require('../db/posts');
const reports = require('../db/reports');
const comments = require('../db/comments');
const accounts = require('../db/accounts');
const tags = require('../db/tags');
const notifications = require('../db/notifications');
const commentsService = require('../services/comments');
const locationsService = require('../services/locations');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// Get comment activity
router.get('/activity', function (req: any, res: any) {

    const accountId = req.user.id;
    
    const offset = Number(req.query.offset);
    const limit = Number(req.query.limit);

    comments.getCommentsActivity(accountId, offset, limit).then((activities: any) => {
        res.status(200).json({ activity: activities });
    }, (err: any) => {
        res.status(500).send('Error getting activity');
    })
});

// Get all comments for a post
router.get('/:postId', async function (req: any, res: any) {
    
    const postId = req.params.postId;
    const accountId = req.user.id;

    const commentLink = req.query.comment;
    let date = req.query.date;
    let type = req.query.type;
    let limit = Number(req.query.limit);

    // If comment id given, get that comment, then get limit-1 posts after that time stamp
    // otherwise get limit timestamps from the given date

    // Type means get before the date or after the date LIMIT #

    // TYPE CAHNGES THE SQL SORT ASC / DESC

    // 

    let commentsArray: any[] = []

    // If given a commentId we fetch that comment and everything after
    if ( commentLink ) {
        await comments.getCommentByLink( commentLink , accountId ).then( (rows: any) => {
            date = rows[0].creation_date;
            type = 'after';
            limit = limit -= 1 || 0;
            commentsArray = commentsArray.concat(rows)
        });
    }

    comments.getCommentByPostId(postId, accountId, date, limit, type).then( async (rows: any) => {

        await commentsService.getTags( rows, accountId ).then( (taggedComments: any) => {
            rows = taggedComments;
        })

        comments.getNumberOfCommentsForPost(postId).then( (num: any) => {
            posts.getPostCreator(postId).then( (postCreator: any) => {
                commentsService.addProfilePicture(rows, postCreator[0].account_id);
                commentsArray = commentsArray.concat(rows)
                res.status(200).json({ postId: postId, comments: commentsArray, totalComments: num[0].total, type: type });
            }, (err: any) => {
                res.status(500).send('Error getting comments');
            });
        }, (err: any) => {
            res.status(500).send('Error getting comments');
        });
    }, (err: any) => {
        console.log(err);
        res.status(500).send('Error getting comments');
    });
});

// Create a comment
router.post('/:postId/add', function (req: any, res: any) {

    const { content, image, tagsList } = req.body;
    const accountId = req.user.id;
    const postId = req.params.postId;
    const link = commentsService.generateLink();

    comments.addComment(postId, accountId, content, image, link).then( async (rows: any) => {

        // Add tags and send notifications
        for ( let index = 0; index < tagsList.length; index++ ) {

            await accounts.getAccountByUsername(tagsList[index].receiver).then( async (account: any) => {
                await tags.addTag( account[0].id, rows[0].id );
                await notifications.addCommentNotification( rows[0].account_id, account[0].id, rows[0].post_id, rows[0].id );
            });

        }

        await commentsService.getTags( rows, accountId ).then( (taggedComments: any) => {
            rows = taggedComments;
        });

        posts.getPostCreator(postId).then( (postCreator: any) => {
            commentsService.addProfilePicture(rows, postCreator[0].account_id);
            res.status(200).json({ postId: postId, comment: rows[0] } );
        }, (err: any) => {
            return Promise.reject(err);
        });
    }, (err: any) => {
        res.status(500).send('Error adding comment');
    });
});

// Delete a single comment
router.delete('/:postId/:commentId', function (req: any, res: any) {

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.deleteCommentById(commentId, accountId).then( (rows: any) => {
        res.status(200).json({ postId: postId, commentId: commentId })
    }, (err: any) => {
        res.status(500).send('Error deleting comment');
    });
});

// Get all replies for a comment on a post
router.get('/:postId/:commentId', function (req: any, res: any) {
    
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;
    const offset = Number(req.query.offset);
    const limit = Number(req.query.limit);

    comments.getRepliesByCommentId(postId, commentId, accountId, offset, limit).then( async (rows: any) => {

        await commentsService.getTags( rows, accountId ).then( (taggedComments: any) => {
            rows = taggedComments;
        })

        comments.getNumberOfRepliesForComment(postId, commentId).then( ( num: any) => {
            posts.getPostCreator(postId).then( (postCreator: any) => {
                commentsService.addProfilePicture(rows, postCreator[0].account_id);
                res.status(200).json({ postId: postId, commentId: commentId, replies: rows, totalReplies: num[0].total });
            }, (err: any) => {
                return Promise.reject(err);
            });
        }, (err: any) => {
            return Promise.reject(err);
        });
    }, (err: any) => {
        res.status(500).send('Error getting replies');
    });
});

// Create a reply
router.post('/:postId/:commentId/add', function (req: any, res: any) {

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const { content, image, tagsList } = req.body;
    const accountId = req.user.id;
    const link = commentsService.generateLink();

    comments.addReply(postId, commentId, accountId, content, image, link).then( async (rows: any) => {

        // Add tags
        for ( let index = 0; index < tagsList.length; index++ ) {
            await accounts.getAccountByUsername(tagsList[index].receiver).then( async (account: any) => {
                await tags.addTag( account[0].id, rows[0].id );
                await notifications.addCommentNotification( rows[0].account_id, account[0].id, rows[0].post_id, rows[0].parent_id );
            });
        }

        await commentsService.getTags( rows, accountId ).then( (taggedComments: any) => {
            rows = taggedComments;
        });

        posts.getPostCreator(postId).then( (postCreator: any) => {
            commentsService.addProfilePicture(rows, postCreator[0].account_id);
            res.status(200).json({ postId: postId, commentId: commentId, reply: rows[0] } );
        }, (err: any) => {
            return Promise.reject(err);
        });

    }, (err: any) => {
        res.status(500).send('Error adding reply');
    });
});

// Delete a single comment
router.delete('/:postId/:parentId/:commentId', function (req: any, res: any) {

    const postId = req.params.postId;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;

    comments.deleteCommentById(commentId, accountId).then( (rows: any) => {
        res.status(200).json({ postId: postId, parentId: parentId, commentId: commentId })
    }, (err: any) => {
        res.status(500).send('Error deleting comment');
    });
});

// Like a comment
router.put('/:postId/:commentId/like', function(req: any, res: any) {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;
    comments.likeComment(commentId, accountId).then((rows: any) => {
        res.status(200).json({ postId: postId, commentId: commentId });
    }, (err: any) => {
        res.status(500).send('Error liking comment');
    })
})

// Dislike a comment
router.put('/:postId/:commentId/dislike', function(req: any, res: any) {
    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;
    comments.dislikeComment(commentId, accountId).then((rows: any) => {
        res.status(200).json({ postId: postId, commentId: commentId });
    }, (err: any) => {
        res.status(500).send('Error disliking comment');
    })
})

// Like a reply
router.put('/:postId/:parentId/:commentId/like', function(req: any, res: any) {
    const postId = req.params.postId;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;
    comments.likeComment(commentId, accountId).then((rows: any) => {
        res.status(200).json({ postId: postId, parentId: parentId, commentId: commentId });
    }, (err: any) => {
        res.status(500).send('Error liking reply');
    })
})

// Dislike a reply
router.put('/:postId/:parentId/:commentId/dislike', function(req: any, res: any) {
    const postId = req.params.postId;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;
    comments.dislikeComment(commentId, accountId).then((rows: any) => {
        res.status(200).json({ postId: postId, parentId: parentId, commentId: commentId });
    }, (err: any) => {
        res.status(500).send('Error disliking reply');
    });
})

// report a comment
router.put('/:postId/:commentId/report', function(req: any, res: any) {

    const postId = req.params.postId;
    const commentId = req.params.commentId;
    const accountId = req.user.id;
    const { content } = req.body;

    reports.addCommentReport( postId, commentId, accountId, content ).then((rows: any) => {
        res.status(200).send({});
    }, (err: any) => {
        res.status(500).send('Error reporting comment');
    });

})

export = router;
