const express = require('express');
const router = express.Router();

const posts = require('../db/posts');
const reports = require('../db/reports');
const comments = require('../db/comments');
const commentsService = require('../services/comments');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// Get post activity
router.get('/activity', function (req: any, res: any) {

    const accountId = req.user.id;
    
    const offset = Number(req.query.offset);
    const limit = Number(req.query.limit);

    comments.getCommentsActivity(accountId, offset, limit).then((rows: any) => {
        res.status(200).json({ activity: rows });
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

    comments.getCommentByPostId(postId, accountId, offset, limit).then( (rows: any) => {
        comments.getNumberOfCommentsForPost(postId).then( (num: any) => {
            posts.getPostCreator(postId).then( (postCreator: any) => {
                commentsService.addProfilePicture(rows, postCreator[0].account_id);
                res.status(200).json({ postId: postId, comments: rows, totalComments: num[0].total });
            }, (err: any) => {
                return Promise.reject(err);
            });
        }, (err: any) => {
            return Promise.reject(err);
        });
    }, (err: any) => {
        res.status(500).send('Error getting comments');
    });
});

// Create a comment
router.post('/:postId/add', function (req: any, res: any) {

    const { content, image } = req.body;
    const accountId = req.user.id;
    const postId = req.params.postId;

    comments.addComment(postId, accountId, content, image).then( (rows: any) => {
        posts.getPostCreator(postId).then( (postCreator: any) => {
            commentsService.addProfilePicture(rows, postCreator[0].account_id);
            res.status(200).json({ postId: postId, comment: rows[0] } );
        }, (err: any) => {
            return Promise.reject(err);
        });
    }, (err: any) => {
        console.log(err);
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

    comments.getRepliesByCommentId(postId, commentId, accountId, offset, limit).then( (rows: any) => {
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
        res.status(500).send('Error getting comments');
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
