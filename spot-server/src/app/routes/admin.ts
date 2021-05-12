const express = require('express');
const router = express.Router();

// ratelimiter
const rateLimiter = require('@src/app/rateLimiter');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// admin route
router.get('/',  rateLimiter.adminLimiter, function (req: any, res: any, next: any) {

    const accountId = req.user.id;
    res.status(200).json('Admin');

});

export = router;
