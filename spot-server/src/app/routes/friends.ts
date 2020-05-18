const express = require('express');
const router = express.Router();

const friends = require('../db/friends');
const accounts = require('../db/accounts');

//errors
const UsernameError = require('@exceptions/friends');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// get friends
router.get('/', function (req: any, res: any) {

    const accountId = req.user.id;

    friends.getFriends(accountId).then((rows: any) => {
        res.status(200).json({ friends: rows });
    }, (err: any) => {
        res.status(500).send('Error getting friends');
    });

});

// delete friend
router.delete('/:friendId', function (req: any, res: any) {

    const accountId = req.user.id;
    const friendId = req.params.friendId;

    friends.deleteFriendById(friendId, accountId).then((rows: any) => {
        res.status(200).json({ friendId: friendId });
    }, (err: any) => {
        console.log(err);
        res.status(500).send('Error deleting friend');
    });
});

// get friend requests
router.get('/requests', function (req: any, res: any) {

    const accountId = req.user.id;

    friends.getFriendRequests(accountId).then((rows: any) => {
        res.status(200).json({ friendRequests: rows });
    }, (err: any) => {
        res.status(500).send('Error getting friend requests');
    });

});

// send a friend request
router.post('/requests', function (req: any, res: any, next: any) {

    const accountId = req.user.id;
    const { username } = req.body;

    // TODO: what if you send a request to someone who sent you a request

    accounts.getAccountByUsername(username).then((receiverId: any) => {

        if ( receiverId[0].id == accountId ) {
            next(new UsernameError('Username Error', 404))
        }

        if ( receiverId[0] === undefined ) {
            res.status(500).send('No user exists with that username');
        } else {
            friends.addFriendRequest(accountId, receiverId[0].id).then((rows: any) => {
                res.status(200).json({ friendRequest: rows[0] });
            }, (err: any) => {
                res.status(500).send('Error sending friend request');
            });
        }
    }, (err: any) => {
        res.status(500).send('Error sending friend request');
    });

});

// delete a friend request
// router.delete('/requests/:friendRequestId', function (req: any, res: any) {

//     const accountId = req.user.id;
//     const friendRequestId = req.params.friendRequestId;

//     friends.deleteFriendRequestsById(friendRequestId, accountId).then((rows: any) => {
//         res.status(200).json({ friendRequest: rows[0] });
//     }, (err: any) => {
//         res.status(500).send('Error deleting friend request');
//     });
// });

// accept a friend request
router.post('/requests/accept', function (req: any, res: any) {

    const accountId = req.user.id;
    const { friendRequestId } = req.body

    friends.acceptFriendRequest(friendRequestId, accountId).then((rows: any) => {
        res.status(200).json({ friendRequestId: friendRequestId });
    }, (err: any) => {
        res.status(500).send('Error accepting friend request');
    });
});

// decline a friend request
router.post('/requests/decline', function (req: any, res: any) {

    const accountId = req.user.id;
    const { friendRequestId } = req.body

    friends.declineFriendRequest(friendRequestId, accountId).then((rows: any) => {
        res.status(200).json({ friendRequestId: friendRequestId });
    }, (err: any) => {
        res.status(500).send('Error declining friend request');
    });
});

export = router;
