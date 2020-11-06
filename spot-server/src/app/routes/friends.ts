const express = require('express');
const router = express.Router();

// db
const friends = require('@db/friends');
const accounts = require('@db/accounts');

// errors
const FriendsError = require('@exceptions/friends');
const ERROR_MESSAGES = require('@exceptions/messages');
const FRIENDS_ERROR_MESSAGES = ERROR_MESSAGES.ERROR_MESSAGES.MAIN.FRIENDS;

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// Get friends of logged in user
router.get('/', function (req: any, res: any, next: any) {

    const accountId = req.user.id;
    const date = req.query.date;
    const limit = Number(req.query.limit);

    friends.getFriends(accountId, date, limit).then((rows: any) => {
        const response = { friends: rows };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new FriendsError.GetFriends(500));
    });

});

// delete a friend with the given friendId
router.delete('/:friendId', function (req: any, res: any, next: any) {

    const accountId = req.user.id;
    const friendId = req.params.friendId;

    friends.deleteFriendById(friendId, accountId).then((rows: any) => {
        const response = { friendId: friendId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new FriendsError.DeleteFriend(500));
    });

});

// get friend requests for the user
router.get('/requests', function (req: any, res: any, next: any) {

    const accountId = req.user.id;

    friends.getFriendRequests(accountId).then((rows: any) => {
        const response = { friendRequests: rows };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new FriendsError.GetFriendRequests(500));
    });

});

// send a friend request
router.post('/requests', function (req: any, res: any, next: any) {

    const accountId = req.user.id;
    const { username } = req.body;

    accounts.getAccountByUsername(username).then((receiverId: any) => {

        // No account with this username
        if ( receiverId[0] === undefined ) {
            return next(new FriendsError.UsernameError(FRIENDS_ERROR_MESSAGES.NO_USER, 400));
        }

        // Cannot add yourself
        if ( receiverId[0].id === accountId ) {
            return next(new FriendsError.UsernameError(FRIENDS_ERROR_MESSAGES.SELF, 400));
        }

        friends.friendRequestExists(receiverId[0].id, accountId).then((friendRequest: any) => {

            // If a request already exists, then just accept it
            if ( friendRequest.length > 0 ) {

                // you already sent a request
                if ( friendRequest[0].account_id === accountId ) {
                    return next(new FriendsError.UsernameError(FRIENDS_ERROR_MESSAGES.REQUEST_EXISTS, 400));
                }

                // accept the request
                friends.acceptFriendRequest(friendRequest[0].id, accountId).then((rows: any) => {
                    res.status(200).json({ friendRequestId: friendRequest[0].id });
                }, (err: any) => {
                    return next(new FriendsError.FriendExistsError(500));
                });

            } else {

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

// accept a friend request
router.post('/requests/accept', function (req: any, res: any, next: any) {

    const accountId = req.user.id;
    const { friendRequestId } = req.body

    friends.acceptFriendRequest(friendRequestId, accountId).then((rows: any) => {

        if ( rows.length < 1 ) {
            return next(new FriendsError.AcceptFriendRequest(500));
        } else {
            // Get the username
            accounts.getAccountById(rows[0].account_id).then( (account: any) => {
                rows[0].username = account[0].username;
                const response = { friend: rows[0] };
                res.status(200).json(response);
            }, (err: any) => {

            });
        }

    }, (err: any) => {
        return next(new FriendsError.AcceptFriendRequest(500));
    });

});

// decline a friend request
router.post('/requests/decline', function (req: any, res: any, next: any) {

    const accountId = req.user.id;
    const { friendRequestId } = req.body

    friends.declineFriendRequest(friendRequestId, accountId).then((rows: any) => {
        const response = { friendRequestId: friendRequestId };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new FriendsError.DeclineFriendRequest(500));
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

export = router;
