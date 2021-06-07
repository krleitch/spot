const express = require('express');
const router = express.Router();

// db
const notifications = require('@db/notifications');
const accounts = require('@db/accounts');
const friends = require('@db/friends');

// services
const commentsService = require('@services/comments');

// ratelimiter
const rateLimiter = require('@src/app/rateLimiter');

// errors
const NotificationsError = require('@exceptions/notifications');
const ErrorHandler = require('@src/app/errorHandler');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// get notifications for the user
router.get('/', rateLimiter.genericNotificationLimiter, ErrorHandler.catchAsync(async (req: any, res: any, next: any) => {

    const accountId = req.user.id;
    const before = req.query.before ? new Date(req.query.before) : null;
    const after = req.query.after ? new Date(req.query.after) : null;
    const limit = Number(req.query.limit);

    notifications.getNotificationByReceiverId(accountId, before, after, limit).then(ErrorHandler.catchAsync( async (rows: any) => {

        // Add tags to comments and replies
        for (let i = 0; i < rows.length; i++) {
            try {
                if ( typeof rows[i].reply_content === 'string' ) {
                    rows[i].reply_content = await commentsService.addTagsToContent( rows[i].reply_id, accountId, rows[i].account_id, rows[i].reply_content);
                } else if ( typeof rows[i].comment_content === 'string' ) {
                    rows[i].comment_content = await commentsService.addTagsToContent( rows[i].comment_id, accountId, rows[i].account_id, rows[i].comment_content);
                }
            } catch (err) {
                return next(new NotificationsError.GetNotifications(500));
            }
        }

        const response = { 
            notifications: rows,
            cursor: {
                before: rows.length > 0 ? rows[0].creation_date : null, 
                after: rows.length > 0 ? rows[rows.length - 1].creation_date : null
            } 
        };
        res.status(200).json(response);

    }, (err: any) => {
        return next(new NotificationsError.GetNotifications(500));
    }));

}));

// get number of unread notifications
router.get('/unread', rateLimiter.genericNotificationLimiter, function (req: any, res: any, next: any) {

    const id = req.user.id;

    notifications.getNotificationUnreadByReceiverId(id).then((rows: any) => {
        const response = { unread: rows[0].unread };
        res.status(200).json(response);
    }, (err: any) => {
        return next(new NotificationsError.GetNotifications(500));
    });

});

// Send a notification, keep errors generic
router.post('/', rateLimiter.genericNotificationLimiter, function (req: any, res: any, next: any) {

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
router.put('/:notificationId/seen', rateLimiter.genericNotificationLimiter, function (req: any, res: any, next: any) {

    const notificationId = req.params.notificationId;
    const accountId = req.user.id;

    // only sets seen if you own it
    notifications.setNotificationSeen(notificationId, accountId).then((rows: any) => {
        const response = { notificationId: notificationId }
        res.status(200).send(response);
    }, (err: any) => {
        return next(new NotificationsError.SeenNotification(500));
    });

});

// Set all notifications as seen
router.put('/seen', rateLimiter.genericNotificationLimiter, function (req: any, res: any, next: any) {

    const accountId = req.user.id;

    notifications.setAllNotificationsSeen(accountId).then((rows: any) => {
        res.status(200).send({});
    }, (err: any) => {
        return next(new NotificationsError.SeenAllNotification(500));
    });

});

// Delete a notification
router.delete('/:notificationId', rateLimiter.genericNotificationLimiter, function (req: any, res: any, next: any) {

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
router.delete('/', rateLimiter.genericNotificationLimiter, function (req: any, res: any, next: any) {

    const accountId = req.user.id;

    notifications.deleteAllNotificationsForAccount(accountId).then((rows: any) => {
        res.status(200).send({});
    }, (err: any) => {
        return next(new NotificationsError.DeleteAllNotification(500));
    });

});


export = router;
