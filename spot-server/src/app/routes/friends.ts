const express = require('express');
const router = express.Router();

const friends = require('../db/friends');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// get friend requests
router.get('/requests', function (req: any, res: any) {

    const accountId = req.user.id;

    notifications.getFriendRequests(accountId).then((rows: any) => {
        res.status(200).json({ requests: rows });
    }, (err: any) => {
        res.status(500).send('Error getting friend requests');
    })

});

export = router;
