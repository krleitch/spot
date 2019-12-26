const express = require('express');
const router = express.Router();

const comments = require('../db/comments');

router.use(function timeLog (req: any, res: any, next: any) {
    // console.log('[COMMENTS] ', Date.now());
    next();
});

// Create a comment
router.post('/:postId/add', function (req: any, res: any) {

    const { Content } = req.body;
    const user = req.user;
    const postId = req.params.postId;

    comments.addComment(postId, user.id, Content).then( (rows: any) => {
        res.status(200).json(rows);
    }, (err: any) => {
        res.sendStatus(500);
    });
});

// Get all comments for a post
router.get('/:postId', function (req: any, res: any) {
    const postId = req.params.postId
    comments.getCommentByPostId(postId).then( (rows: any) => {
        res.status(200).json(rows)
    }, (err: any) => {
        res.sendStatus(500);
    });
});

// delete a single comment
router.delete('/:commentId', function (req: any, res: any) {
    const commentId = req.params.commentId;
    comments.deleteComment(commentId).then( (rows: any) => {
        res.status(200).json(rows)
    }, (err: any) => {
        res.sendStatus(500);
    });
});

export = router;
