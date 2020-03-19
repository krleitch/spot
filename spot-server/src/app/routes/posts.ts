const express = require('express');
const router = express.Router();

const posts = require('../db/posts');
const reports = require('../db/reports');
const postsService = require('../services/posts');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// Get all posts
router.get('/', function (req: any, res: any) {

    const accountId = req.user.id;
    
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const location = req.query.location;
    const sort = req.query.sort;
    const offset = Number(req.query.offset);
    const limit = Number(req.query.limit);

    // https://gis.stackexchange.com/questions/31628/find-points-within-a-distance-using-mysql
    // USE THIS
    posts.getPosts(accountId, sort, offset, limit).then((rows: any) => {
        rows = rows.filter( ( post: any ) => postsService.filterLocation(post, location, latitude, longitude));
        res.status(200).json({ posts: rows });
    }, (err: any) => {
        res.status(500).send('Error getting posts');
    })
});

// Get a single post
router.get('/:postLink', function (req: any, res: any) {
    const postLink = req.params.postLink;
    const accountId = req.user.id;
    posts.getPostByLink(postLink, accountId).then((rows: any) => {
        res.status(200).json({ post: rows[0] });
    }, (err: any) => {
        res.status(500).send('Error getting post');
    })
});

// Add a post
router.post('/', function (req: any, res: any) {
   
    const accountId = req.user.id;
    const { content, location, image } = req.body;
    const link = postsService.generateLink();

    posts.addPost(content, location, image, link, accountId).then((rows: any) => {
        res.status(200).json({ post: rows[0] });
    }, (err: any) => {
        console.log(err);
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
    const accountId = req.user.id;
    posts.deletePost(postId, accountId).then((rows: any) => {
        res.status(200).json({ postId: postId });
    }, (err: any) => {
        res.status(500).send('Error deleting post');
    })
})

// report a post
router.put('/:postId/report', function(req: any, res: any) {

    const postId = req.params.postId;
    const accountId = req.user.id;
    const { content } = req.body;

    reports.addPostReport( postId, accountId, content ).then((rows: any) => {
        res.status(200).send({})
    }, (err: any) => {
        res.status(500).send('Error reporting post');
    });

})

export = router;
