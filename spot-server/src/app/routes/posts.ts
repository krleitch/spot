const express = require('express');
const router = express.Router();

// db
const posts = require('../db/posts');
const reports = require('../db/reports');
const locations = require('../db/locations');

// services
const postsService = require('../services/posts');
const locationsService = require('../services/locations');

// errors
const PostsError = require('@exceptions/posts');
const AuthenticationError = require('@exceptions/authentication');
const ErrorHandler = require('@src/app/errorHandler');

// constants
const CONSTANTS = require('@constants/posts');

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
    const date = req.query.date;

    locationsService.verifyLocation( accountId, latitude, longitude ).then( (valid: boolean) => {

        if ( valid ) {

            locations.addLocation( accountId, latitude, longitude ).then( () => {

                posts.getPosts(accountId, sort, location, latitude, longitude, offset, limit, date).then((rows: any) => {

                    // add the distance
                    rows.map( (row: any) => {
                        let newRow = row
                        newRow.distance = locationsService.distanceBetween( latitude, longitude, row.latitude, row.longitude, 'M' );
                        newRow.inRange = newRow.distance <= 10;
                        delete newRow.latitude;
                        delete newRow.longitude;
                        return newRow;
                    });

                    res.status(200).json({ posts: rows });
                }, (err: any) => {
                    res.status(500).send('Error getting posts');
                });

            });

        } else {
            res.status(500).send('Error gettings posts from your location');
        }

    });
});

// Add a post
router.post('/', ErrorHandler.catchAsync( async (req: any, res: any, next: any) => {

    // You must have an account to make a post
    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const accountId = req.user.id;
    const { content, location, image } = req.body;

    // You must either have some text or an image
    if ( content.length == 0 && !image ) {
        return next(PostsError.NoPostContent(400));
    }

    const contentError = postsService.validContent(content);
    if ( contentError ) {
        return next(contentError);
    }

    const link = await postsService.generateLink();

    locationsService.getGeolocation( location.latitude, location.longitude ).then( (geolocation: string) => {

        posts.addPost(content, location, image, link, accountId, geolocation).then((rows: any) => {

            rows.map( (row: any) => {
                let newRow = row
                newRow.distance = locationsService.distanceBetween( location.latitude, location.longitude, row.latitude, row.longitude, 'M' );
                newRow.inRange = newRow.distance <= 10;
                delete newRow.latitude;
                delete newRow.longitude;
                return newRow;
            });

            const response = { post: rows[0] }
            res.status(200).json(response);
        }, (err: any) => {
            return next(PostsError.PostError(500));
        });

    });

}) );

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

// Get post activity
router.get('/activity', function (req: any, res: any) {

    const accountId = req.user.id;
    
    const date = req.query.date;
    const limit = Number(req.query.limit);
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    posts.getPostsActivity(accountId, date, limit).then((rows: any) => {

        rows.map( (row: any) => {
            let newRow = row
            newRow.distance = locationsService.distanceBetween( latitude, longitude, row.latitude, row.longitude, 'M' );
            newRow.inRange = newRow.distance <= 10;
            delete newRow.latitude;
            delete newRow.longitude;
            return newRow;
        });

        res.status(200).json({ activity: rows });
    }, (err: any) => {
        res.status(500).send('Error getting activity');
    })
});

// Get a single post
router.get('/:postLink',  function (req: any, res: any) {

    const postLink = req.params.postLink;
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    posts.getPostByLink(postLink, req.authenticated ? req.user.id: null).then((rows: any) => {

        // add the distance
        rows.map( (row: any) => {
            let newRow = row
            newRow.distance = locationsService.distanceBetween( latitude, longitude, row.latitude, row.longitude, 'M' );
            newRow.inRange = newRow.distance <= 10;
            delete newRow.latitude;
            delete newRow.longitude;
            return newRow;
        });

        res.status(200).json({ post: rows[0] });
    }, (err: any) => {
        res.status(500).send('Error getting post');
    })
});

export = router;
