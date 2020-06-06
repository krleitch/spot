const express = require('express');
const router = express.Router();

const accounts = require('../db/accounts');
const passwordReset = require('../db/passwordReset');
const auth = require('../services/auth/auth')
const nodemailer = require('nodemailer');

const shortid = require('shortid');

const passport = require('../services/auth/passport');

const AuthError = require('@exceptions/authentication');
const ERROR_MESSAGES = require('@exceptions/messages');
const AUTH_ERROR_MESSAGES = ERROR_MESSAGES.ERROR_MESSAGES.PRE_AUTH.AUTHENTICATION;

router.use(function timeLog (req: any, res: any, next: any) {
    // console.log('[AUTH] ', Date.now());
    next();
});

// Register - Given password should already be hashed once
router.post('/register', function (req: any, res: any, next: any) {
    const { email, username, password, phone } = req.body;

    // Validation

    const error = auth.validUsername(username);
    if ( error) {
        return next(error);
    }

    console.log('made it')

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
            
            const token = shortid.generate();

            // send email with nodemailer

            nodemailer.createTestAccount().then( ( testAccount: any) => {

                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: testAccount.user, // generated ethereal user
                        pass: testAccount.pass // generated ethereal password
                    }
                });

                // send mail with defined transport object
                transporter.sendMail({
                    from: '"SPOT" <spot@example.com>', // sender address
                    to: "test1@example.com, test2@example.com", // list of receivers
                    subject: "SPOT", // Subject line
                    text: "Password Reset?", // plain text body
                    html: "<b>Token: </b>" + token // html body
                }).then( ( info: any ) => {
                    console.log("Password Reset URL: %s", nodemailer.getTestMessageUrl(info));
                });

            });

            // add to table

            passwordReset.addPasswordReset(rows[0].id, token).then( (r: any) => {
                res.status(200).send({});
            });

        }

    });
                      
});

// password reset
router.post('/new-password/validate', function (req: any, res: any) {

    const { token } = req.body;

    passwordReset.getByToken(token).then( (rows: any) => {
        if ( rows.length > 0 ) {
            res.status(200).send({});
        } else {
            // FIX
            res.status(500).send({});
        }
    });
                      
});

// password reset
router.post('/new-password', function (req: any, res: any) {

    const { password, token } = req.body;

    passwordReset.getByToken(token).then( (rows: any) => {

        const validDate = new Date( new Date(rows[0].creation_date).valueOf() + 5 * 60000 )

        if ( rows.length > 0 && ( new Date().valueOf() < validDate.valueOf() ) ) {

            const salt = auth.generateSalt();
            const hash = auth.hashPassword(password, salt);

            accounts.changePassword( rows[0].account_id, hash, salt ).then( (r: any) => {
                res.status(200).send({});
            });

        } else {
            // error
            console.log('test')
            res.status(500).send({});
        }
    });
                      
});

export = router;
