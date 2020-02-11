const express = require('express');
const router = express.Router();

const comments = require('../db/comments');
const posts = require('../db/posts');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// Get all posts
router.get('/', function (req: any, res: any) {

    const accountId = req.user.id;
    const offset = Number(req.query.offset);
    const limit = Number(req.query.limit);

    posts.getPosts(accountId, offset, limit).then((rows: []) => {
        res.status(200).json({ posts: rows });
    }, (err: any) => {
        console.log(err);
        res.status(500).send('Error getting posts');
    })
});

// Get a single post
router.get('/:postId', function (req: any, res: any) {
    const postId = req.params.postId;
    const accountId = req.user.id;
    posts.getPostById(postId, accountId).then((rows: any) => {
        res.status(200).json({ post: rows[0] });
    }, (err: any) => {
        res.status(500).send('Error getting post');
    })
});

// Add a post
router.post('/', function (req: any, res: any) {
    const { content } = req.body;
    const accountId = req.user.id;
    posts.addPost(content, accountId).then((rows: any) => {
        res.status(200).json({ post: rows[0] });
    }, (err: any) => {
        res.status(500).send('Error adding post');
    })
});

// Like a post
router.put('/:postId/like', function(req: any, res: any) {
    const postId = req.params.postId;
    const accountId = req.user.id;
    posts.likePost(postId, accountId).then((rows: any) => {
        res.status(200).json({ postId: postId });
    }, (err: any) => {
        res.status(500).send('Error liking post');
    })
})

// Dislike a post
router.put('/:postId/dislike', function(req: any, res: any) {
    const postId = req.params.postId;
    const accountId = req.user.id;
    posts.dislikePost(postId, accountId).then((rows: any) => {
        res.status(200).json({ postId: postId });
    }, (err: any) => {
        res.status(500).send('Error disliking post');
    })
})

// Delete a post
router.delete('/:postId', function(req: any, res: any) {
    const postId = req.params.postId;
    posts.deletePost(postId).then((rows: any) => {
        res.status(200).json({ postId: postId });
    }, (err: any) => {
        res.status(500).send('Error deleting post');
    })
})

export = router;
