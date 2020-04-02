const express = require('express');
const router = express.Router();

const friends = require('../db/friends');
const accounts = require('../db/accounts');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// get friend requests
router.get('/requests', function (req: any, res: any) {

    const accountId = req.user.id;

    notifications.getFriendRequests(accountId).then((rows: any) => {
        res.status(200).json({ friendRequests: rows });
    }, (err: any) => {
        res.status(500).send('Error getting friend requests');
    })

});

// send a friend request
router.post('/requests', function (req: any, res: any) {

    const accountId = req.user.id;
    const { username } = req.body;

    accounts.getAccountByUsername(username).then((receiverId: any) => {
        if ( receiverId[0] === undefined ) {
            res.status(500).send('No user exists with that username');
        } else {
            friends.addNotification(accountId, receiverId[0].id).then((rows: any) => {
                res.status(200).json({ friendRequest: rows[0] });
            }, (err: any) => {
                return Promise.reject(err);
            });
        }
    }, (err: any) => {
        res.status(500).send('Error sending friend request');
    })

});

// delete a friend request
router.delete('/requests/:friendRequestId', function (req: any, res: any) {

    const accountId = req.user.id;
    const friendRequestId = req.params.friendRequestId;

    friends.addNotification(friendRequestId, accountId).then((rows: any) => {
        res.status(200).json({ friendRequest: rows[0] });
    }, (err: any) => {
        res.status(500).send('Error deleting friend request');
    });
});

export = router;
