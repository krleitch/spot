const express = require('express');
const router = express.Router();

const notifications = require('../db/notifications');
const accounts = require('../db/accounts');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// get notifications
router.get('/', function (req: any, res: any) {

    const id = req.user.id;

    notifications.getNotificationByReceiverId(id).then((rows: any) => {
        res.status(200).json({ notifications: rows });
    }, (err: any) => {
        res.status(500).send('Error getting notifications');
    })

});

router.post('/', function (req: any, res: any) {

    const { receiver, postId } = req.body;

    const senderId = req.user.id;

    accounts.getAccountByUsername(receiver).then((retAccount: any) => {
        if ( retAccount[0] === undefined ) {
            res.status(500).send('No user exists with that username');
        } else {
            notifications.addNotification(senderId, retAccount[0].id, postId).then((rows: any) => {
                res.status(200).json({ notification: rows[0] });
            }, (err: any) => {
                return Promise.reject(err);
            })
        }
    }, (err: any) => {
        res.status(500).send('Error sending notification');
    })

});

router.post('/:notificationId', function (req: any, res: any) {

    const notificationId = req.params.notificationId;

    notifications.setNotificationSeen(notificationId).then((rows: any) => {
        res.status(200).send();
    }, (err: any) => {
        res.status(500).send('Error updating notification');
    })

});




export = router;
