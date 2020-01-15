const express = require('express');
const router = express.Router();

const comments = require('../db/comments');
const posts = require('../db/posts');

router.use(function timeLog (req: any, res: any, next: any) {
    // console.log('[POSTS] ', Date.now());
    next();
});

// Get all posts
router.get('/', function (req: any, res: any) {
    posts.getPosts().then((rows: any) => {
        res.status(200).json(rows);
    }, (err: any) => {
        res.sendStatus(500);
    })
});

// Get a single post
router.get('/:postId', function (req: any, res: any) {
    const id = req.params.postId;
    posts.getPostById(id).then((rows: any) => {
        res.status(200).json(rows[0]);
    }, (err: any) => {
        res.sendStatus(500);
    })
});

// Add a post
router.post('/', function (req: any, res: any) {

    const { content } = req.body;
    const user = req.user;

    posts.addPost(content, user.id).then((rows: any) => {
        res.status(200).json(rows[0]);
    }, (err: any) => {
        console.log(err);
        res.sendStatus(500);
    })
});

// Like a post
router.put('/:postId/like', function(req: any, res: any) {
    const id = req.params.postId;
    posts.likePost(id).then((rows: any) => {
        res.status(200).json(rows[0]);
    }, (err: any) => {
        res.sendStatus(500);
    })
})

// Dislike a post
router.put('/:postId/dislike', function(req: any, res: any) {
    const id = req.params.postId;
    posts.dislikePost(id).then((rows: any) => {
        res.status(200).json(rows[0]);
    }, (err: any) => {
        res.sendStatus(500);
    })
})

// Delete a post
router.delete('/:postId', function(req: any, res: any) {
    const id = req.params.postId;
    comments.deleteCommentByPostId(id).then((rows: any) => {
        posts.deletePost(id).then((rows: any) => {
            res.status(200).json(rows);
        }, (err: any) => {
            res.sendStatus(500);
        })
    }, (err: any) => {
        res.sendStatus(500);
    });

})

export = router;
