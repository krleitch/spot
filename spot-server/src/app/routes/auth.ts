const express = require('express');
const router = express.Router();

const accounts = require('../db/accounts');
const auth = require('../services/auth/auth')

const passport = require('../services/auth/passport');

const RegisterRequest = require('@models/authentication');

router.use(function timeLog (req: any, res: any, next: any) {
    // console.log('[AUTH] ', Date.now());
    next();
});

// Register - Given password should already be hashed once
router.post('/register', function (req: any, res: any) {
    const { email, username, password, phone } = req.body;
    const salt = auth.generateSalt();
    const hash = auth.hashPassword(password, salt);
    accounts.addAccount(email, username, hash, phone, salt).then( (rows: any) => {
        accounts.getAccountByEmail(email).then ( (rows: any) => {
            const user = rows[0]
            const token = auth.generateToken(user);
            res.status(200).json({
                jwt: { token: token, expiresIn: '2h' },
                user: user
            });  
        }, (err: any) => {
            res.status(500).send('Cannot login to account');
        });
    }, (err: any) => {
        res.status(500).send('Cannot create account');
    });
});

// Get a user token
router.post('/login', passport.authenticate('local', {session: true}), function (req: any, res: any) {
    const user = req.user;
    const token = auth.generateToken(user);
    res.status(200).json({
        jwt: { token: token, expiresIn: '2h' },
        user: user
    });                            
});

// Facebook login
router.post('/register/facebook', function (req: any, res: any) {
    const { accessToken } = req.body;
    auth.getFacebookDetails(accessToken).then( (facebookDetails: any) => {
        accounts.addFacebookAccount(facebookDetails.body.id, facebookDetails.body.email).then( (rows: any) => {
            accounts.getFacebookAccount(facebookDetails.body.id).then(( user: any) => {
                user = user[0];
                const token = auth.generateToken(user);
                res.status(200).json({
                    jwt: { token: token, expiresIn: '2h' },
                    user: user
                });   
            }, (err: any) => {
                res.sendStatus(500);
            })   
        }, (err: any) => {
           res.sendStatus(500);
        });
    }, (err: any) => {
        res.sendStatus(500);
    });
});

// Facebook login
router.post('/login/facebook', function (req: any, res: any) {
    const { accessToken } = req.body;
    auth.getFacebookDetails(accessToken).then( (facebookDetails: any) => {
        accounts.getFacebookAccount(facebookDetails.body.id).then(( user: any) => {
            user = user[0];
            const token = auth.generateToken(user);
            res.status(200).json({
                jwt: { token: token, expiresIn: '2h' },
                user: user
            });        
        }, (err: any) => {
            res.sendStatus(500);
        })   
    }, (err: any) => {
        res.sendStatus(500);
    });
});

export = router;
