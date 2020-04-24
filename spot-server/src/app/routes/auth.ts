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
                account: user
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
        account: user
    });                            
});

// Facebook Register
// router.post('/register/facebook', function (req: any, res: any) {
//     const { accessToken } = req.body;
//     auth.getFacebookDetails(accessToken).then( (facebookDetails: any) => {
//         accounts.addFacebookAccount(facebookDetails.body.id, facebookDetails.body.email).then( (rows: any) => {
//             accounts.getFacebookAccount(facebookDetails.body.id).then(( user: any) => {
//                 user = user[0];
//                 const token = auth.generateToken(user);
//                 res.status(200).json({
//                     jwt: { token: token, expiresIn: '2h' },
//                     user: user
//                 });   
//             }, (err: any) => {
//                 res.sendStatus(500);
//             })   
//         }, (err: any) => {
//            res.sendStatus(500);
//         });
//     }, (err: any) => {
//         res.sendStatus(500);
//     });
// });

// Facebook login
router.post('/login/facebook', function (req: any, res: any) {
    const { accessToken } = req.body;
    auth.getFacebookDetails(accessToken).then( (facebookDetails: any) => {
        accounts.getFacebookAccount(facebookDetails.body.id).then(( user: any) => {
            if ( user.length == 0 ) {
                // create the account
                accounts.addFacebookAccount(facebookDetails.body.id, facebookDetails.body.email).then( (user2: any) => {
                    user2 = user2[0];
                    const token = auth.generateToken(user2);
                    res.status(200).json({
                        created: true,
                        jwt: { token: token, expiresIn: '2h' },
                        account: user2
                    });   
                }, (err: any) => {
                    return Promise.reject(err);
                });            
            } else {
                // account already exists
                user = user[0];
                const token = auth.generateToken(user);
                res.status(200).json({
                    created: false,
                    jwt: { token: token, expiresIn: '2h' },
                    account: user
                });   
            }
        }, (err: any) => {
            return Promise.reject(err);
        })   
    }, (err: any) => {
        res.status(500).send('Error signing in with facebook');
    });
});

// password reset
router.post('/password-reset', function (req: any, res: any) {

    const { email } = req.body;

    accounts.getAccountByEmail(email).then( (rows: any) => {
        if ( rows.length > 0 ) {
            
            console.log(rows[0].email);

            // send email with nodemailer

        }
        res.status(200).send({});
    });
                      
});

export = router;
