const express = require('express');
const router = express.Router();

const uuid = require('uuid');

// db
const posts = require('@db/posts');
const reports = require('@db/reports');

// services
const postsService = require('@services/posts');
const locationsService = require('@services/locations');
const imageService =  require('@services/image');
const authorization = require('@services/authorization/authorization');
const singleUpload = imageService.upload.single('image');

// errors
const PostsError = require('@exceptions/posts');
const ReportError = require('@exceptions/report');
const AuthenticationError = require('@exceptions/authentication');
const ErrorHandler = require('@helpers/errorHandler');

// ratelimiter
const rateLimiter = require('@helpers/rateLimiter');

// constants
const posts_constants = require('@constants/posts');
const POSTS_CONSTANTS = posts_constants.POSTS_CONSTANTS;
const report_constants = require('@constants/report');
const REPORT_CONSTANTS = report_constants.REPORT_CONSTANTS;
const roles = require('@services/authorization/roles');

// config
const config = require('@config/config');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// Get all posts
router.get('/', rateLimiter.genericPostLimiter, ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {

    // You must have an account to get all posts
    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const accountId = req.user.id;
    
    // latitude and longitude are optional if location is global
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    const location = req.query.location;
    const sort = req.query.sort;
    const offset = Number(req.query.offset);
    const limit = Number(req.query.limit);
    const date = req.query.date || null;

    posts.getPosts(accountId, sort, location, latitude, longitude, offset, limit, date).then((rows: any) => {

        // add the distance
        rows = locationsService.addDistanceToRows(rows, latitude, longitude, true);

        const response = { posts: rows };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new PostsError.GetPosts(500));
    });

}));

// Add a post
router.post('/', rateLimiter.createPostLimiter , ErrorHandler.catchAsync( async (req: any, res: any, next: any) => {

    // You must have an account to make a post
    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    // You must be verified to make a post
    if ( !req.verified ) {
        return next(new AuthenticationError.VerifyError(400));
    }

    if ( authorization.checkRole(req.user, [roles.guest])) {
        return next(new PostsError.PostError(500));
    }

    const accountId = req.user.id;
    const postId = uuid.v4();

    // set the filename for aws s3 bucket
    req.filename = postId;

    singleUpload(req, res, ErrorHandler.catchAsync(async function(err: any) {

        // error uploading image
        if (err) {
            return next(new PostsError.PostImage(422));
        }

        let { content, location } = JSON.parse(req.body.json)
        const image = req.file ? req.file.location: null

        // remove leading and trailing whitespaces
        content = content.trim();

        // check if line length matches
        if ( content.split(/\r\n|\r|\n/).length > POSTS_CONSTANTS.MAX_LINE_LENGTH ) {
            return next(new PostsError.InvalidPostLineLength(400, POSTS_CONSTANTS.MAX_LINE_LENGTH))
        }

        // You must either have some text or an image
        if ( content.length == 0 && !image ) {
            return next(new PostsError.NoPostContent(400));
        }

        const contentError = postsService.validContent(content);
        if ( contentError ) {
            return next(contentError);
        }

        const link = await postsService.generateLink();

        let imageNsfw = false;
        if ( config.testNsfwLocal ) {
            imageNsfw = await imageService.predictNsfw(postId, image, 'post');
        }

        locationsService.getGeolocation( location.latitude, location.longitude ).then( (geolocation: string) => {
            posts.addPost(postId, content, location, image, imageNsfw, link, accountId, geolocation).then((rows: any) => {

                // async test nsfw
                if ( config.testNsfwLambda && image ) {
                    imageService.predictNsfwLambda(image).then( (result: any) => {
                        if ( result.StatusCode === 200 ) {
                            const payload = JSON.parse(result.Payload);
                            if ( payload.statusCode === 200 ) {
                                const predict = JSON.parse(payload.body);
                                if ( predict.hasOwnProperty('className') ) {
                                    const isNsfw = predict.className === 'Porn' || predict.className === 'Hentai';
                                    posts.updateNsfw(postId, isNsfw);     
                                }
                            }
                        }
                    }, (err: any) => {});
                }

                rows = locationsService.addDistanceToRows(rows, location.latitude, location.longitude, true);
                const response = { post: rows[0] }
                res.status(200).json(response);
            }, (err: any) => {
                return next(new PostsError.PostError(500));
            });
        }, ( err: any) => {
            return next(new PostsError.PostError(500));
        });

    }));

}));

// Like a post
router.put('/:postId/like', rateLimiter.genericPostLimiter, function(req: any, res: any, next: any) {

    // You must have an account to like a post
    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    if ( authorization.checkRole(req.user, [roles.guest])) {
        return next(new PostsError.LikePost(500));
    }

    const postId = req.params.postId;
    const accountId = req.user.id;

    posts.likePost(postId, accountId).then((rows: any) => {
        const response = { postId: postId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new PostsError.LikePost(500));
    });

});

// Dislike a post
router.put('/:postId/dislike', rateLimiter.genericPostLimiter, function(req: any, res: any, next: any) {

    // You must have an account to dislike a post
    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    if ( authorization.checkRole(req.user, [roles.guest])) {
        return next(new PostsError.DislikePost(500));
    }

    const postId = req.params.postId;
    const accountId = req.user.id;

    posts.dislikePost(postId, accountId).then((rows: any) => {
        const response = { postId: postId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new PostsError.DislikePost(500));
    });

});

// remove like / dislike from post
router.put('/:postId/unrated', rateLimiter.genericPostLimiter, function(req: any, res: any, next: any) {

    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    if ( authorization.checkRole(req.user, [roles.guest])) {
        return next(new PostsError.UnratedPost(500));
    }

    const postId = req.params.postId;
    const accountId = req.user.id;

    posts.unratedPost(postId, accountId).then((rows: any) => {
        const response = { postId: postId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new PostsError.UnratedPost(500));
    });

});

// Delete a post
router.delete('/:postId', rateLimiter.genericPostLimiter, function(req: any, res: any, next: any) {

    // You must have an account to delete a post
    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    if ( authorization.checkRole(req.user, [roles.guest])) {
        return next(new PostsError.DeletePost(500));
    }

    const postId = req.params.postId;
    const accountId = req.user.id;

    posts.checkOwned(postId, accountId).then((owned: boolean) => {

        if ( owned || authorization.checkRole(req.user, [roles.owner, roles.admin]) ) {

            posts.deletePost(postId).then((rows: any) => {
                const response = { postId: postId };
                res.status(200).json(response);
            }, (err: any) => {
                return next(new PostsError.DeletePost(500));
            });

        } else {
            return next(new PostsError.DeletePost(500));
        }

    }, (err: any) => {
        return next(new PostsError.DeletePost(500));
    });

});

// report a post
router.put('/:postId/report', rateLimiter.genericPostLimiter, function(req: any, res: any, next: any) {

    // You must have an account to report something
    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    if ( authorization.checkRole(req.user, [roles.guest])) {
        return next(new ReportError.ReportError(500));
    }

    const postId = req.params.postId;
    const accountId = req.user.id;
    const { content, category } = req.body;

    if ( content.length < REPORT_CONSTANTS.MIN_CONTENT_LENGTH || content.length > REPORT_CONSTANTS.MAX_CONTENT_LENGTH ) {
        return next(new ReportError.ReportLengthError(400, REPORT_CONSTANTS.MIN_CONTENT_LENGTH, REPORT_CONSTANTS.MAX_CONTENT_LENGTH));
    }

    reports.addPostReport( postId, accountId, content, category ).then((rows: any) => {
        res.status(200).send({});
    }, (err: any) => {
        return next(new ReportError.ReportError(500));
    });

});

// Get post activity
router.get('/activity', rateLimiter.genericPostLimiter, function (req: any, res: any, next: any) {

    // You must have an account to see activity
    if ( !req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
    }

    const accountId = req.user.id;
    
    const before = req.query.before ? new Date(req.query.before): null;
    const after = req.query.after ? new Date(req.query.after): null;
    const limit = Number(req.query.limit);
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    posts.getPostsActivity(accountId, before, after, limit).then((rows: any) => {
        rows = locationsService.addDistanceToRows(rows, latitude, longitude, true);
        const response = { 
            activity: rows,
             size: rows.length,
             cursor: { 
                 before: rows.length > 0 ? rows[0].creation_date : null, 
                 after: rows.length > 0 ? rows[rows.length - 1].creation_date : null
            } 
        };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new PostsError.PostActivity(500));
    });

});

// Get a single post
router.get('/:postLink', rateLimiter.genericPostLimiter, function (req: any, res: any, next: any) {

    // getting individual posts does not need an account
    const postLink = req.params.postLink;

    // Optional - needed to supply distances
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    posts.getPostByLink(postLink, req.authenticated ? req.user.id: null).then((rows: any) => {

        if ( rows.length < 1 ) {
            return next(new PostsError.GetSinglePost(500));
        }

        rows = locationsService.addDistanceToRows(rows, latitude, longitude, true);
        const response = { post: rows[0] };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new PostsError.GetSinglePost(500));
    });

});

export = router;
