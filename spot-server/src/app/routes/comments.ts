const express = require('express');
const router = express.Router();

const posts = require('../db/posts');
const reports = require('../db/reports');
const comments = require('../db/comments');
const accounts = require('../db/accounts');
const tags = require('../db/tags');
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
router.get('/:postId', function (req: any, res: any) {
    
    const postId = req.params.postId;
    const accountId = req.user.id;
    const offset = Number(req.query.offset);
    const limit = Number(req.query.limit);

    // TODO: get tags as well and use profile picture on that too

    comments.getCommentByPostId(postId, accountId, offset, limit).then( async (rows: any) => {

        // get tags for each comment
        for ( let index = 0; index < rows.length; index++ ) {
            await tags.getTagsByCommentId(rows[index].id).then( (tagList: any) => {
                rows[index].tagList = tagList;
            });
        }

        comments.getNumberOfCommentsForPost(postId).then( (num: any) => {
            posts.getPostCreator(postId).then( (postCreator: any) => {
                commentsService.addProfilePicture(rows, postCreator[0].account_id);
                res.status(200).json({ postId: postId, comments: rows, totalComments: num[0].total });
            }, (err: any) => {
                res.status(500).send('Error getting comments');
            });
        }, (err: any) => {
            res.status(500).send('Error getting comments');
        });
    }, (err: any) => {
        res.status(500).send('Error getting comments');
    });
});

// Create a comment
router.post('/:postId/add', function (req: any, res: any) {

    const { content, image, tagsList } = req.body;
    const accountId = req.user.id;
    const postId = req.params.postId;

    comments.addComment(postId, accountId, content, image).then( async (rows: any) => {

        // TODO: confirm this async call is correct
        // Add tags
        for ( let index = 0; index < tagsList.length; index++ ) {
            await accounts.getAccountByUsername(tagsList[index].receiver).then(  (account: any) => {
                tags.addTag( account[0].id, rows[0].id );
            });
        }

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

        // get tags for each reply
        for ( let index = 0; index < rows.length; index++ ) {
            await tags.getTagsByCommentId(rows[index].id).then( (tagList: any) => {
                rows[index].tagList = tagList;
            });
        }

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
    const { content, image } = req.body;
    const accountId = req.user.id;

    comments.addReply(postId, commentId, accountId, content, image).then( (rows: any) => {
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
