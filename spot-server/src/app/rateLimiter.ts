const rateLimit = require("express-rate-limit");

// See for handler details
// https://www.npmjs.com/package/express-rate-limit

const RateLimitError = require('@exceptions/rateLimit');

export { adminLimiter, genericPostLimiter, createCommentLimiter, genericCommentLimiter, createPostLimiter,
            authenticationLimiter, passwordResetLimiter, tokenLimiter, newPasswordLimiter, genericFriendLimiter,
            genericNotificationLimiter }

// The RateLimitError constructor is (code, limit, timeout)

// Admin
const adminTimeout = 1; // minutes
const adminLimit = 60;
const adminLimiter = rateLimit({
    windowMs: adminTimeout * 60 * 1000,
    max: adminLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, adminLimit, adminTimeout))
    }
});

// Notification Limiters
const genericNotificationTimeout = 1; // minutes
const genericNotificationLimit = 60;
const genericNotificationLimiter = rateLimit({
    windowMs: genericNotificationTimeout * 60 * 1000,
    max: genericNotificationLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, genericNotificationLimit, genericNotificationTimeout))
    }
});

// Friend Limiters
const genericFriendTimeout = 1; // minutes
const genericFriendLimit = 60;
const genericFriendLimiter = rateLimit({
    windowMs: genericFriendTimeout * 60 * 1000,
    max: genericFriendLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, genericFriendLimit, genericFriendTimeout))
    }
});

// Post Limiters
const createPostTimeout = 1; // minutes
const createPostLimit = 1;
const createPostLimiter = rateLimit({
    windowMs: createPostTimeout * 60 * 1000,
    max: createPostLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, createPostLimit, createPostTimeout))
    }
});

const genericPostTimeout = 1; // minutes
const genericPostLimit = 300;
const genericPostLimiter = rateLimit({
    windowMs: genericPostTimeout * 60 * 1000,
    max: genericPostLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, genericPostLimit, genericPostTimeout))
    }
});

// Comment Limiters
const createCommentTimeout = 1; // minutes
const createCommentLimit = 5;
const createCommentLimiter = rateLimit({
    windowMs: createCommentTimeout * 60 * 1000,
    max: createCommentLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, createCommentLimit, createCommentTimeout))
    }
});

const genericCommentTimeout = 1; // minutes
const genericCommentLimit = 300;
const genericCommentLimiter = rateLimit({
    windowMs: genericCommentTimeout * 60 * 1000,
    max: genericCommentLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, genericCommentLimit, genericCommentTimeout))
    }
});

// Authentication Limiters
const authenticationTimeout = 5; // minutes
const authenticationLimit = 10;
const authenticationLimiter = rateLimit({
    windowMs: authenticationTimeout * 60 * 1000,
    max: authenticationLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, authenticationLimit, authenticationTimeout))
    }
});

const passwordResetTimeout = 5; // minutes
const passwordResetLimit = 5;
const passwordResetLimiter = rateLimit({
    windowMs: passwordResetTimeout * 60 * 1000,
    max: passwordResetLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, passwordResetLimit, passwordResetTimeout))
    }
});

const tokenTimeout = 5; // minutes
const tokenLimit = 5;
const tokenLimiter = rateLimit({
    windowMs: tokenTimeout * 60 * 1000,
    max: tokenLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, tokenLimit, tokenTimeout))
    }
});

const newPasswordTimeout = 5; // minutes
const newPasswordLimit = 5;
const newPasswordLimiter = rateLimit({
    windowMs: newPasswordTimeout * 60 * 1000,
    max: newPasswordLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, newPasswordLimit, newPasswordTimeout))
    }
});
