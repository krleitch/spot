const rateLimit = require("express-rate-limit");

// See for handler details
// https://www.npmjs.com/package/express-rate-limit

const RateLimitError = require('@exceptions/rateLimit');

export { createPostLimiter, loginLimiter, passwordResetLimiter, tokenLimiter, newPasswordLimiter,
            updateUsernameLimiter }

// The RateLimitError constructor is (code, limit, timeout)

// General

// Post Limiters

const createPostTimeout = 1;
const createPostLimit = 50;
const createPostLimiter = rateLimit({
    windowMs: createPostTimeout * 60 * 1000, // timeout minutes
    max: createPostLimit, // max limit posts
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, createPostLimit, createPostTimeout))
    }
});

// Account Limiters

const loginTimeout = 5;
const loginLimit = 10;
const loginLimiter = rateLimit({
    windowMs: loginTimeout * 60 * 1000,
    max: loginLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, loginLimit, loginTimeout))
    }
});

const passwordResetTimeout = 5;
const passwordResetLimit = 5;
const passwordResetLimiter = rateLimit({
    windowMs: passwordResetTimeout * 60 * 1000,
    max: passwordResetLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, passwordResetLimit, passwordResetTimeout))
    }
});

const tokenTimeout = 5;
const tokenLimit = 5;
const tokenLimiter = rateLimit({
    windowMs: tokenTimeout * 60 * 1000,
    max: tokenLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, tokenLimit, tokenTimeout))
    }
});

const newPasswordTimeout = 5;
const newPasswordLimit = 5;
const newPasswordLimiter = rateLimit({
    windowMs: newPasswordTimeout * 60 * 1000,
    max: newPasswordLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, newPasswordLimit, newPasswordTimeout))
    }
});

const updateUsernameTimeout = 1440;
const updateUsernameLimit = 1;
const updateUsernameLimiter = rateLimit({
    windowMs: updateUsernameTimeout * 60 * 1000,
    max: updateUsernameLimit,
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, updateUsernameLimit, updateUsernameTimeout))
    }
});
