const express = require('express');
const router = express.Router();

// db
const notifications = require('@db/notifications');
const accounts = require('@db/accounts');
const posts = require('@db/posts');

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

    notifications.getNotificationByReceiverId(accountId, date, limit).then(ErrorHandler.catchAsync( async (rows: any) => {
        // Add the tags to each comment
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

// get # of unread notifications
router.get('/unread', function (req: any, res: any) {

    const id = req.user.id;

    notifications.getNotificationUnreadByReceiverId(id).then((rows: any) => {
        res.status(200).json({ unread: rows[0].unread });
    }, (err: any) => {
        res.status(500).send('Error getting unread notifications');
    })

});


router.post('/', function (req: any, res: any) {

    const { receiver, postLink } = req.body;

    const senderId = req.user.id;

    accounts.getAccountByUsername(receiver).then((retAccount: any) => {
        if ( retAccount[0] === undefined ) {
            res.status(500).send('No user exists with that username');
        } else {
            posts.getPostByLink(postLink, senderId).then((postRes: any) => {
                notifications.addNotification(senderId, retAccount[0].id, postRes[0].id).then((rows: any) => {
                    res.status(200).json({ notification: rows[0] });
                }, (err: any) => {
                    return Promise.reject(err);
                });
            }, (err: any) => {
                return Promise.reject(err);
            });
        }
    }, (err: any) => {
        res.status(500).send('Error sending notification');
    })

});

router.put('/:notificationId/seen', function (req: any, res: any) {

    const notificationId = req.params.notificationId;

    notifications.setNotificationSeen(notificationId).then((rows: any) => {
        res.status(200).send();
    }, (err: any) => {
        res.status(500).send('Error updating notification');
    })

});

router.put('/seen', function (req: any, res: any) {

    const accountId = req.user.id;

    notifications.setAllNotificationsSeen(accountId).then((rows: any) => {
        res.status(200).send();
    }, (err: any) => {
        res.status(500).send('Error updating notifications');
    })

});

router.delete('/:notificationId', function (req: any, res: any) {

    const notificationId = req.params.notificationId;

    notifications.deleteNotificationById(notificationId).then((rows: any) => {
        res.status(200).send({ notificationId: notificationId });
    }, (err: any) => {
        res.status(500).send('Error deleting notification');
    })

});

router.delete('/', function (req: any, res: any) {

    const accountId = req.user.id;

    notifications.deleteAllNotificationsForAccount(accountId).then((rows: any) => {
        res.status(200).send();
    }, (err: any) => {
        res.status(500).send('Error deleting all notifications');
    })

});


export = router;
