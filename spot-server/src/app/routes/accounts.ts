const passport = require('passport');
const express = require('express');
const router = express.Router();

const accounts = require('../db/accounts');

router.use(function timeLog (req: any, res: any, next: any) {
    // console.log('[ACCOUNTS] ', Date.now());
    next();
});

router.delete('/delete', passport.authenticate('jwt', {session: false}), function (req: any, res: any) {
    const user = req.user;
    accounts.deleteAccount(user.id).then( (rows: any) => {
        res.status(200);   
    }, (err: any) => {
        res.status(500).send('Error deleting account');
    });
})

router.get('/account', passport.authenticate('jwt', {session: false}), function (req: any, res: any) {
    const user = req.user;
    accounts.getAccountById(user.id).then((rows: any) => {
        res.status(200).json({ account: rows[0] });
    }, (err: any) => {
        res.status(500).send("Error getting the account");
    })
})

export = router;
