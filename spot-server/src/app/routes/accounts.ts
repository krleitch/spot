const passport = require('passport');
const express = require('express');
const router = express.Router();

const accounts = require('../db/accounts');

const authService = require('@services/authentication/authentication');
const friendsService = require('@services/friends');

router.use(function timeLog (req: any, res: any, next: any) {
    // console.log('[ACCOUNTS] ', Date.now());
    next();
});

router.delete('/delete', passport.authenticate('jwt', {session: false}), function (req: any, res: any) {
    const accountId = req.user.id;
    accounts.deleteAccount(accountId).then( (rows: any) => {
        res.status(200);   
    }, (err: any) => {
        res.status(500).send('Error deleting account');
    });
})

router.get('/account', passport.authenticate('jwt', {session: false}), function (req: any, res: any) {
    const accountId = req.user.id;
    accounts.getAccountById(accountId).then((rows: any) => {
        res.status(200).json({ account: rows[0] });
    }, (err: any) => {
        res.status(500).send("Error getting the account");
    })
})

router.put('/account', passport.authenticate('jwt', {session: false}), function (req: any, res: any) {

    const accountId = req.user.id;
    const { username } = req.body;

    accounts.updateUsername(username, accountId).then((rows: any) => {
        res.status(200).json({ account: rows[0] });
    }, (err: any) => {
        res.status(500).send("Error updating username");
    })
})

// Facebook Connect
router.post('/facebook', function (req: any, res: any) {

    const { accessToken } = req.body;
    const accountId = req.user.id;

    authService.getFacebookId(accessToken).then( ( facebookId: any) => {
        accounts.getFacebookAccount(facebookId.body.id).then(( user: any) => {
            if ( user.length == 0 ) {
                // create the account
                accounts.connectFacebookAccount(facebookId.body.id, accountId).then( (rows: any) => {

                    friendsService.addFacebookFriends(accessToken).then( (res: any) => {

                        res.status(200).json({
                            created: true
                        });  

                    }, ( err: any ) => {
                        res.status(500).send('Error connecting account with facebook');
                    });

                }, (err: any) => {
                    res.status(500).send('Error connecting account with facebook');
                });            
            } else {
                // account already exists
            }
        }, (err: any) => {
            res.status(500).send('Error signing in with facebook');
        })   
    }, (err: any) => {
        res.status(500).send('Error signing in with facebook');
    });
});

router.post('/facebook/disconnect', function (req: any, res: any) {

    const accountId = req.user.id;

    // remove the facebook id from the account

    accounts.disconnectFacebookAccount(accountId).then( (rows: any) => {
        res.sendStatus(200);
    }, (err: any) => {
        res.status(500).send('Error disconnecting account with facebook');
    });   
  
});

export = router;
