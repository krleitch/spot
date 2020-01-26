const express = require('express');
const router = express.Router();

const comments = require('../db/comments');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// Get all comments for a post
router.get('/:postId', function (req: any, res: any) {
    
    const postId = req.params.postId;
    const accountId = req.user.id;
    const offset = Number(req.query.offset);
    const limit = Number(req.query.limit);

    comments.getCommentByPostId(postId, accountId, offset, limit).then( (rows: any) => {
        comments.getNumberOfCommentsForPost(postId).then( (num: any) => {
            res.status(200).json({ postId: postId, comments: rows, totalComments: num[0].total });
        }, (err: any) => {
            return Promise.reject(err);
        });
    }, (err: any) => {
        res.status(500).send('Error getting comments');
    });
});

// Create a comment
router.post('/:postId/add', function (req: any, res: any) {

    const { content } = req.body;
    const accountId = req.user.id;
    const postId = req.params.postId;

    comments.addComment(postId, accountId, content).then( (rows: any) => {
        res.status(200).json({ postId: postId, comment: rows[0] } );
    }, (err: any) => {
        res.status(500).send('Error adding comment');
    });
});

// Delete a single comment
router.delete('/:postId/:commentId', function (req: any, res: any) {

    const postId = req.params.postId;
    const commentId = req.params.commentId;

    comments.deleteCommentById(commentId).then( (rows: any) => {
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
            res.status(200).json({ postId: postId, commentId: commentId, replies: rows, totalReplies: num[0].total });
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
    const { content } = req.body;
    const accountId = req.user.id;

    comments.addReply(postId, commentId, accountId, content).then( (rows: any) => {
        res.status(200).json({ postId: postId, commentId: commentId, reply: rows[0] } );
    }, (err: any) => {
        res.status(500).send('Error adding reply');
    });
});

// Delete a single comment
router.delete('/:postId/:parentId/:commentId', function (req: any, res: any) {

    const postId = req.params.postId;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;

    comments.deleteCommentById(commentId).then( (rows: any) => {
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
    })
})

export = router;
