const express = require('express');
const router = express.Router();

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// admin route
router.get('/', function (req: any, res: any, next: any) {

    const accountId = req.user.id;

    res.status(200).json('Welcome to Admin Area');

});

export = router;
