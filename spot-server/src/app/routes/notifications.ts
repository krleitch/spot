const express = require('express');
const router = express.Router();

const notifications = require('../db/notifications');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// get notifications
router.get('/', function (req: any, res: any) {

    const username = req.user.username;

    notifications.getNotificationsByUsername(username).then((rows: any) => {
        res.status(200).json({ notifications: rows });
    }, (err: any) => {
        res.status(500).send('Error getting notifications');
    })

});

router.post('/', function (req: any, res: any) {

    const { receiver, postId } = req.body;

    const sender = req.user.username;

    notifications.addNotification(sender, receiver, postId).then((rows: any) => {
        res.status(200).josn({ notification: rows[0] });
    }, (err: any) => {
        res.status(500).send('Error sending notification');
    })

});




export = router;
