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
    posts.getPosts(accountId).then((rows: []) => {
        res.status(200).json(rows);
    }, (err: any) => {
        console.log(err);
        res.status(500).send('Error getting posts');
    })
});

// Get a single post
router.get('/:postId', function (req: any, res: any) {
    const id = req.params.postId;
    posts.getPostById(id).then((rows: any) => {
        res.status(200).json(rows[0]);
    }, (err: any) => {
        res.status(500).send('Error getting post');
    })
});

// Get a posts rating
router.get('/:postId/rating', function (req: any, res: any) {
    const post_id = req.params.postId;
    const account_id = req.user.id;
    posts.getRatingForPost(post_id, account_id).then((rows: any) => {
        res.status(200).json(rows[0]);
    }, (err: any) => {
        res.status(500).send('Error rating post');
    })
});

// Add a post
router.post('/', function (req: any, res: any) {
    const { content } = req.body;
    const user = req.user;
    posts.addPost(content, user.id).then((rows: any) => {
        res.status(200).json(rows[0]);
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
    comments.deleteCommentByPostId(postId).then((rows: any) => {
        posts.deletePost(postId).then((rows: any) => {
            res.status(200).json({ postId: postId });
        }, (err: any) => {
            res.status(500).send('Error deleting post');
        })
    }, (err: any) => {
        res.status(500).send('Error deleting post');
    });

})

export = router;
