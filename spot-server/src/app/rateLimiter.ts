const rateLimit = require("express-rate-limit");

// See for handler details
// https://www.npmjs.com/package/express-rate-limit

const RateLimitError = require('@exceptions/rateLimit');

export { createPostLimiter, loginLimiter }

// The RateLimitError constructor is (code, limit, timeout)

const createPostLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 50, // max 5 posts
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, 50, 1))
    }
});

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 1 minutes
    max: 3, // max 3 login attempts
    handler: function (req: any, res: any, next: any) {
        return next(new RateLimitError.RateLimitError(429, 10, 5))
    }
});
