const express = require('express');
const router = express.Router();

const posts = require('../db/posts');
const postsService = require('../services/posts');


// const imageService = require('../services/image');
const upload = require('../services/image');
const singleUpload = upload.single('image');


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

    posts.getPosts(accountId, sort, offset, limit).then((rows: any) => {
        rows = rows.filter( ( post: any ) => postsService.filterLocation(post, location, latitude, longitude));
        res.status(200).json({ posts: rows });
    }, (err: any) => {
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
    // const { content, location, image } = req.body;
    const accountId = req.user.id;

    // imageService.uploadImage(image);

    singleUpload(req, res, function(err: any) {
        if (err) {
            console.log(err)
            return res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}]});
        }
    
        return res.json({'imageUrl': req.file.location});
    });


    // posts.addPost(content, location, accountId).then((rows: any) => {
    //     res.status(200).json({ post: rows[0] });
    // }, (err: any) => {
    //     res.status(500).send('Error adding post');
    // })
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
