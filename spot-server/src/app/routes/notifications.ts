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

    accounts.getAccountByUsername(receiver).then((recevierAccount: any) => {
        notifications.addNotification(senderId, recevierAccount[0].id, postId).then((rows: any) => {
            res.status(200).json({ notification: rows[0] });
        }, (err: any) => {
            return Promise.reject(err);
        })
    }, (err: any) => {
        console.log(err);
        res.status(500).send('Error sending notification');
    })

});




export = router;
