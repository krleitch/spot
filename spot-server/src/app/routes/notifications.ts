const express = require('express');
const router = express.Router();

// db
const notifications = require('@db/notifications');
const accounts = require('@db/accounts');
const posts = require('@db/posts');
const friends = require('@db/friends');

// services
const commentsService = require('@services/comments');

// errors
const NotificationsError = require('@exceptions/notifications');
const ErrorHandler = require('@src/app/errorHandler');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// get notifications for the user
router.get('/', ErrorHandler.catchAsync(async (req: any, res: any, next: any) => {

    const accountId = req.user.id;
    const date = req.query.date;
    const limit = Number(req.query.limit);

    // for testing delays
    await new Promise(r => setTimeout(r, 5000));

    notifications.getNotificationByReceiverId(accountId, date, limit).then(ErrorHandler.catchAsync( async (rows: any) => {

        // Add tags to comments and replies
        for (let i = 0; i < rows.length; i++) {
            try {
                if ( rows[i].comment_content ) {
                    rows[i].comment_content = await commentsService.addTagsToContent( rows[i].comment_id, accountId, rows[i].account_id, rows[i].comment_content);
                }
                if ( rows[i].reply_content ) {
                    rows[i].reply_content = await commentsService.addTagsToContent( rows[i].reply_id, accountId, rows[i].account_id, rows[i].reply_content);
                }
            } catch (err) {
                return next(new NotificationsError.GetNotifications(500));
            }
        }

        const response = { notifications: rows, date: date };
        res.status(200).json(response);

    }, (err: any) => {
        return next(new NotificationsError.GetNotifications(500));
    }));

}));

// get number of unread notifications
router.get('/unread', function (req: any, res: any, next: any) {

    const id = req.user.id;

    notifications.getNotificationUnreadByReceiverId(id).then((rows: any) => {
        const response = { unread: rows[0].unread };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new NotificationsError.GetNotifications(500));
    });

});

// Send a notification, keep errors generic
router.post('/', function (req: any, res: any, next: any) {

    const { receiver, postId, commentId } = req.body;
    const accountId = req.user.id;

    accounts.getAccountByUsername(receiver).then(ErrorHandler.catchAsync(async (receiver: any) => {
        // The receiving account doesnt exist
        if ( !receiver[0] ) {
            return next(new NotificationsError.SendNotification(500));
        }
        receiver = receiver[0];

        // Make sure they are friends
        await friends.getFriendsExist(accountId, receiver.id).then( (friendExists: any) => {
            if ( !friendExists[0] ) {
                return next(new NotificationsError.SendNotification(500));
            }
        }, (err: any) => {
            return next(new NotificationsError.SendNotification(500));
        });

        if ( commentId ) {

            notifications.addCommentNotification(accountId, receiver.id, postId, commentId).then((rows: any) => {
                const response = { notification: rows[0] };
                res.status(200).json(response);
            }, (err: any) => {
                return next(new NotificationsError.SendNotification(500));
            });

        } else {

            notifications.addNotification(accountId, receiver.id, postId).then((rows: any) => {
                const response = { notification: rows[0] };
                res.status(200).json(response);
            }, (err: any) => {
                return next(new NotificationsError.SendNotification(500));
            });

        }
   
    }, (err: any) => {
        return next(new NotificationsError.SendNotification(500));
    }));

});

// Set a notification as seen
router.put('/:notificationId/seen', function (req: any, res: any, next: any) {

    const notificationId = req.params.notificationId;
    const accountId = req.user.id;

    // only sets seen if you own it
    notifications.setNotificationSeen(notificationId, accountId).then((rows: any) => {
        res.status(200).send({});
    }, (err: any) => {
        return next(new NotificationsError.SeenNotification(500));
    });

});

// Set all notifications as seen
router.put('/seen', function (req: any, res: any, next: any) {

    const accountId = req.user.id;

    notifications.setAllNotificationsSeen(accountId).then((rows: any) => {
        res.status(200).send({});
    }, (err: any) => {
        return next(new NotificationsError.SeenAllNotification(500));
    });

});

// Delete a notification
router.delete('/:notificationId', function (req: any, res: any, next: any) {

    const notificationId = req.params.notificationId;
    const accountId = req.user.id;

    // only removes if you own it
    notifications.deleteNotificationById(notificationId, accountId).then((rows: any) => {
        const response = { notificationId: notificationId };
        res.status(200).send(response);
    }, (err: any) => {
        return next(new NotificationsError.DeleteNotification(500));
    });

});

// Delete all notifications
router.delete('/', function (req: any, res: any, next: any) {

    const accountId = req.user.id;

    notifications.deleteAllNotificationsForAccount(accountId).then((rows: any) => {
        res.status(200).send({});
    }, (err: any) => {
        return next(new NotificationsError.DeleteAllNotification(500));
    });

});


export = router;
