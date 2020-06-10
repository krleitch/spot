const express = require('express');
const router = express.Router();

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// get friends
router.get('/', function (req: any, res: any) {

    const accountId = req.user.id;

    res.status(200).json('Welcom to Admin Area');
    // res.status(500).send('Error getting friends');

});

export = router;
