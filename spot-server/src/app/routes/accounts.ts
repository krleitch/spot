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
        res.status(200).json(rows);   
    }, (err: any) => {
    });
})

router.get('/account', passport.authenticate('jwt', {session: false}), function (req: any, res: any) {
    const user = req.user;
    accounts.getAccountById(user.id).then((rows: any) => {
        res.status(200).json(rows[0]);
    }, (err: any) => {
        console.log(err);
        res.sendStatus(500);
    })
})

export = router;
