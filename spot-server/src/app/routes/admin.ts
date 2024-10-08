import express from 'express';
const router = express.Router();

// ratelimiter
import rateLimiter from '@helpers/rateLimiter.js';

router.use(function timeLog(req: any, res: any, next: any) {
  next();
});

// admin route
router.get(
  '/',
  rateLimiter.adminLimiter,
  function (req: any, res: any, next: any) {
    const accountId = req.user.id;
    res.status(200).json('Admin');
  }
);

export default router;
