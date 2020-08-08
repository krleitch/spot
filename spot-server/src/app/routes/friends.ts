const express = require('express');
const router = express.Router();

const friends = require('../db/friends');
const accounts = require('../db/accounts');

//errors
const FriendsError = require('@exceptions/friends');
const ERROR_MESSAGES = require('@exceptions/messages');
const FRIENDS_ERROR_MESSAGES = ERROR_MESSAGES.ERROR_MESSAGES.MAIN.FRIENDS;

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// get friends
router.get('/', function (req: any, res: any) {

    const accountId = req.user.id;
    const date = req.query.date;
    const limit = Number(req.query.limit);

    friends.getFriends(accountId, date, limit).then((rows: any) => {
        res.status(200).json({ friends: rows });
    }, (err: any) => {
        console.log(err);
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

    accounts.getAccountByUsername(username).then((receiverId: any) => {

        if ( receiverId[0] === undefined ) {
            return next(new FriendsError.UsernameError(FRIENDS_ERROR_MESSAGES.NO_USER, 400));
        }

        if ( receiverId[0].id == accountId ) {
            return next(new FriendsError.UsernameError(FRIENDS_ERROR_MESSAGES.SELF, 400));
        }

        friends.friendRequestFrom(receiverId[0].id).then((friendRequest: any) => {

            // If a request already exists, then just accept it
            if ( friendRequest.length > 0 ) {

                friends.acceptFriendRequest(friendRequest[0].id, accountId).then((rows: any) => {
                    res.status(200).json({ friendRequestId: friendRequest[0].id });
                }, (err: any) => {
                    return next(new FriendsError.FriendExistsError(500));
                });

            } else {

                // TODO: What if friend already added

                friends.addFriendRequest(accountId, receiverId[0].id).then((rows: any) => {
                    res.status(200).json({ friendRequest: rows[0] });
                }, (err: any) => {
                    return next(new FriendsError.UsernameError(FRIENDS_ERROR_MESSAGES.GENERIC, 500));
                });

            }

        }, (err: any) => {
            return next(new FriendsError.FriendExistsError(500));
        });

    }, (err: any) => {
        return next(new FriendsError.UsernameError(FRIENDS_ERROR_MESSAGES.GENERIC, 500))
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
        res.status(200).json({ friend: rows[0] });
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
