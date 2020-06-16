const express = require('express');
const router = express.Router();

const posts = require('../db/posts');
const reports = require('../db/reports');
const locations = require('../db/locations');
const postsService = require('../services/posts');
const locationsService = require('../services/locations');
const constants = require('@config/constants');

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
                        newRow.inRange = newRow.distance <= constants.RANGE;
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
router.post('/', function (req: any, res: any) {
   
    const accountId = req.user.id;
    const { content, location, image } = req.body;
    const link = postsService.generateLink();

    // Only allow Ascii characters
    // Will allow some emojis eventually, utf7mb4 is on the content field already
    const isValid = /^[\x00-\x7F]*$/.test(content);
    
    console.log(content, isValid)

    locationsService.getGeolocation( location.latitude, location.longitude ).then( (geolocation: any) => {

        locationsService.verifyLocation( accountId, location.latitude, location.longitude ).then( (valid: boolean) => {

            if ( valid ) {

                locations.addLocation( accountId, location.latitude, location.longitude ).then( () => {

                    posts.addPost(content, location, image, link, accountId, geolocation).then((rows: any) => {
                        res.status(200).json({ post: rows[0] });
                    }, (err: any) => {
                        console.log(err);
                        res.status(500).send('Error adding post');
                    });

                });
                
            } else {
                res.status(500).send('Error adding post from your location');
            }

        });

    });

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
            newRow.inRange = newRow.distance <= constants.RANGE;
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
            newRow.inRange = newRow.distance <= constants.RANGE;
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
