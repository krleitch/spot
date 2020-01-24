import { deleteCommentByPostId } from "../db/comments";

const express = require('express');
const router = express.Router();

const comments = require('../db/comments');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// Get all comments for a post
router.get('/:postId', function (req: any, res: any) {
    const postId = req.params.postId

    const offset = Number(req.query.offset);
    const limit = Number(req.query.limit);

    comments.getCommentByPostId(postId, offset, limit).then( (rows: any) => {
        res.status(200).json({ postId: postId, comments: rows });
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

    comments.deleteComment(commentId).then( (rows: any) => {
        res.status(200).json({ postId: postId, commentId: commentId })
    }, (err: any) => {
        res.status(500).send('Error deleting comment');
    });
});

export = router;
