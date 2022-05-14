import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// See for handler details
// https://www.npmjs.com/package/express-rate-limit

import { RateLimitError } from '@exceptions/rateLimit.js';

// The RateLimitError constructor is (code = 429, limit, timeout, showTimeout = false)
// showTimeout will format the error message to include the timeout in it

// Admin
const adminTimeout = 1; // minutes
const adminLimit = 60;
const adminLimiter = rateLimit({
  windowMs: adminTimeout * 60 * 1000,
  max: adminLimit,
  handler: function (_req: Request, _res: Response, next: NextFunction) {
    return next(new RateLimitError(429, adminLimit, adminTimeout));
  }
});

// Notification Limiters
const genericNotificationTimeout = 1; // minutes
const genericNotificationLimit = 60;
const genericNotificationLimiter = rateLimit({
  windowMs: genericNotificationTimeout * 60 * 1000,
  max: genericNotificationLimit,
  handler: function (_req: Request, _res: Response, next: NextFunction) {
    return next(
      new RateLimitError(
        429,
        genericNotificationLimit,
        genericNotificationTimeout
      )
    );
  }
});

// Friend Limiters
const genericFriendTimeout = 1; // minutes
const genericFriendLimit = 60;
const genericFriendLimiter = rateLimit({
  windowMs: genericFriendTimeout * 60 * 1000,
  max: genericFriendLimit,
  handler: function (_req: Request, _res: Response, next: NextFunction) {
    return next(
      new RateLimitError(429, genericFriendLimit, genericFriendTimeout)
    );
  }
});

// Spot Limiters
const createSpotTimeout = 1; // minutes
const createSpotLimit = 1;
const createSpotLimiter = rateLimit({
  windowMs: createSpotTimeout * 60 * 1000,
  max: createSpotLimit,
  handler: function (_req: Request, _res: Response, next: NextFunction) {
    return next(new RateLimitError(429, createSpotLimit, createSpotTimeout));
  },
  skipFailedRequests: true
});

const genericSpotTimeout = 1; // minutes
const genericSpotLimit = 300;
const genericSpotLimiter = rateLimit({
  windowMs: genericSpotTimeout * 60 * 1000,
  max: genericSpotLimit,
  handler: function (_req: Request, _res: Response, next: NextFunction) {
    return next(new RateLimitError(429, genericSpotLimit, genericSpotTimeout));
  }
});

// Comment Limiters
const createCommentTimeout = 1; // minutes
const createCommentLimit = 5;
const createCommentLimiter = rateLimit({
  windowMs: createCommentTimeout * 60 * 1000,
  max: createCommentLimit,
  handler: function (_req: Request, _res: Response, next: NextFunction) {
    return next(
      new RateLimitError(429, createCommentLimit, createCommentTimeout)
    );
  },
  skipFailedRequests: true
});

const genericCommentTimeout = 1; // minutes
const genericCommentLimit = 300;
const genericCommentLimiter = rateLimit({
  windowMs: genericCommentTimeout * 60 * 1000,
  max: genericCommentLimit,
  handler: function (_req: Request, _res: Response, next: NextFunction) {
    return next(
      new RateLimitError(429, genericCommentLimit, genericCommentTimeout)
    );
  }
});

// Authentication Limiters
const authenticationTimeout = 5; // minutes
const authenticationLimit = 10;
const authenticationLimiter = rateLimit({
  windowMs: authenticationTimeout * 60 * 1000,
  max: authenticationLimit,
  handler: function (_req: Request, _res: Response, next: NextFunction) {
    return next(
      new RateLimitError(429, authenticationLimit, authenticationTimeout, true)
    );
  },
  skipSuccessfulRequests: true
});

const passwordResetTimeout = 5; // minutes
const passwordResetLimit = 5;
const passwordResetLimiter = rateLimit({
  windowMs: passwordResetTimeout * 60 * 1000,
  max: passwordResetLimit,
  handler: function (_req: Request, _res: Response, next: NextFunction) {
    return next(
      new RateLimitError(429, passwordResetLimit, passwordResetTimeout, true)
    );
  },
  skipSuccessfulRequests: true
});

const tokenTimeout = 5; // minutes
const tokenLimit = 5;
const tokenLimiter = rateLimit({
  windowMs: tokenTimeout * 60 * 1000,
  max: tokenLimit,
  handler: function (_req: Request, _res: Response, next: NextFunction) {
    return next(new RateLimitError(429, tokenLimit, tokenTimeout));
  },
  skipSuccessfulRequests: true
});

const newPasswordTimeout = 5; // minutes
const newPasswordLimit = 5;
const newPasswordLimiter = rateLimit({
  windowMs: newPasswordTimeout * 60 * 1000,
  max: newPasswordLimit,
  handler: function (_req: Request, _res: Response, next: NextFunction) {
    return next(new RateLimitError(429, newPasswordLimit, newPasswordTimeout));
  },
  skipSuccessfulRequests: true
});

export default {
  adminLimiter,
  genericSpotLimiter,
  createCommentLimiter,
  genericCommentLimiter,
  createSpotLimiter,
  authenticationLimiter,
  passwordResetLimiter,
  tokenLimiter,
  newPasswordLimiter,
  genericFriendLimiter,
  genericNotificationLimiter
};
