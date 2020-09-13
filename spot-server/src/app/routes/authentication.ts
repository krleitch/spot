const express = require('express');
const router = express.Router();

const shortid = require('shortid');

// exceptions
const AuthError = require('@exceptions/authentication');

// db
const accounts = require('@db/accounts');
const passwordReset = require('@db/passwordReset');

// services
const authentication = require('@services/authentication/authentication');
const friendsService = require('@services/friends');
const mail = require('@services/mail');

// ratelimiter
const rateLimiter = require('@src/app/rateLimiter');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

// Register - Given password should already be hashed once
router.post('/register', function (req: any, res: any, next: any) {

    const { email, username, password, phone } = req.body;

    // Validation

    const emailError = authentication.validEmail(email);
    if ( emailError) {
        return next(emailError);
    }

    const usernameError = authentication.validUsername(username);
    if ( usernameError) {
        return next(usernameError);
    }

    const passwordError = authentication.validPassword(password);
    if ( passwordError) {
        return next(passwordError);
    }

    const phoneError = authentication.validPhone(phone);
    if ( phoneError) {
        return next(phoneError);
    }

    const salt = authentication.generateSalt();
    const hash = authentication.hashPassword(password, salt);

    accounts.addAccount(email, username, hash, phone, salt).then( (account: any) => {
        accounts.addAccountMetadata(account[0].id).then ( (rows: any) => {
            const user = account[0]
            const token = authentication.generateToken(user);
            res.status(200).json({
                jwt: { token: token, expiresIn: 2 },
                account: user
            });  
        }, (err: any) => {
            return next(new AuthError.AuthenticationServerError(500));
        });
    }, (err: any) => {

        // A duplicate exists
        if ( err.code === 'ER_DUP_ENTRY' ) {

            // get the column name for the duplicate from the message
            const column = err.sqlMessage.match(/'.*?'/g).slice(-1)[0].replace(/[']+/g, '');

            if ( column == 'email' ) {
                return next(new AuthError.EmailTakenError(400));
            } else if ( column == 'username' ) {
                return next(new AuthError.UsernameTakenError(400));
            } else if ( column == 'phone' ) {
                return next(new AuthError.PhoneTakenError(400));
            }

        }

        return next(new AuthError.AuthenticationServerError(500));
        
    });
});

// Get a user token
router.post('/login', rateLimiter.loginLimiter, authentication.localAuth, function (req: any, res: any) {
    const user = req.user;
    const token = authentication.generateToken(user);
    res.status(200).json({
        jwt: { token: token, expiresIn: 2 },
        account: user
    });                            
});

// Facebook login
router.post('/login/facebook', function (req: any, res: any, next: any) {
    const { accessToken } = req.body;
    authentication.getFacebookDetails(accessToken).then( (facebookDetails: any) => {
        accounts.getFacebookAccount(facebookDetails.body.id).then( async( user: any) => {
            if ( user.length == 0 ) {

                const username = await authentication.createUsernameFromEmail(facebookDetails.body.email);

                // create the account
                accounts.addFacebookAccount(facebookDetails.body.id, facebookDetails.body.email, username).then( (user2: any) => {
                    accounts.addAccountMetadata(user2[0].id).then( (rows: any ) => {

                        user2 = user2[0];
                        const token = authentication.generateToken(user2);

                        // add facebook friends
                        friendsService.addFacebookFriends(accessToken, user2[0].id).then( (res: any) => {

                            res.status(200).json({
                                created: true,
                                jwt: { token: token, expiresIn: 2 },
                                account: user2
                            }, ( err: any) => {
                                // couldnt add your friends
                                return next(new AuthError.FacebookSignUpError(500));
                            });  

                        });

                    }, (err: any) => {
                        return next(new AuthError.FacebookSignUpError(500));
                    });
 
                }, (err: any) => {
                    return next(new AuthError.FacebookSignUpError(500));
                });            
            } else {
                // account already exists
                user = user[0];
                const token = authentication.generateToken(user);
                res.status(200).json({
                    created: false,
                    jwt: { token: token, expiresIn: 2 },
                    account: user
                });   
            }
        }, (err: any) => {
            return next(new AuthError.FacebookSignUpError(500));
        })   
    }, (err: any) => {
        return next(new AuthError.FacebookSignUpError(500));
    });
});

// Google
router.post('/login/google', async function (req: any, res: any, next: any) {
    
    const { accessToken } = req.body;
    
    try {

        const ticket = await authentication.verifyGoogleIdToken(accessToken);

        const payload = ticket.getPayload();
        const userid = payload['sub'];
        const email = payload['email'];

        // make or retrieve account

        accounts.getGoogleAccount(userid).then( async( user: any) => {
            if ( user.length == 0 ) {

                const username = await authentication.createUsernameFromEmail(email);

                // create the account
                accounts.addGoogleAccount(userid, email, username).then( (user2: any) => {
                    accounts.addAccountMetadata(user2[0].id).then( (rows: any ) => {

                        user2 = user2[0];
                        const token = authentication.generateToken(user2);

                        res.status(200).json({
                            created: true,
                            jwt: { token: token, expiresIn: 2 },
                            account: user2
                        });

                    }, (err: any) => {
                        return next(new AuthError.GoogleSignUpError(500));
                    });
                }, (err: any) => {
                    return next(new AuthError.GoogleSignUpError(500));
                });
 
            } else {
                // account already exists
                user = user[0];
                const token = authentication.generateToken(user);
                res.status(200).json({
                    created: false,
                    jwt: { token: token, expiresIn: 2 },
                    account: user
                });   
            }
        }, (err: any) => {
            return next(new AuthError.GoogleSignUpError(500));
        });
    } catch (err) {
        return next(new AuthError.GoogleSignUpError(500));
    }

});


// password reset
router.post('/password-reset', rateLimiter.passwordResetLimiter, function (req: any, res: any) {

    const { email } = req.body;

    accounts.getAccountByEmail(email).then( (rows: any) => {
        if ( rows.length > 0 ) {
            
            const token = shortid.generate();

            // send email with nodemailer

            mail.transporter.sendMail({
                from: 'krleitch.ca@gmail.com', // TODO: CHANGE
                to: 'krleitch.ca@gmail.com', // TODO: CHANGE
                subject: 'Message',
                text: "Password Reset?", // plain text body
                html: "<b>Token: </b>" + token, // html body
                ses: { // optional extra arguments for SendRawEmail
                    Tags: [{
                        Name: 'tagname',
                        Value: 'tagvalue'
                    }]
                }
            }, (err: any, info: any) => {
                
                if ( err ) {
                    res.status(500).send({});
                } else {
                    // add to table
                    passwordReset.addPasswordReset(rows[0].id, token).then( (r: any) => {
                        res.status(200).send({});
                    }, (err: any) => {
                        res.status(500).send({});
                    });
                }

            });

        } else {
            // No account
            res.status(200).send({});
        }

    }, (err: any) => {
        res.status(500).send({});
    });
                      
});

// checks if a token for password reset exists and is valid
router.post('/new-password/validate', rateLimiter.tokenLimiter, function (req: any, res: any, next: any) {

    const { token } = req.body;

    passwordReset.getByToken(token).then( (rows: any) => {
        if ( rows.length > 0 ) {

            if ( authentication.isValidToken(rows[0]) ) {
                res.status(200).send({  token: token, valid: true });
            } else {
                // Token expired
                return next(new AuthError.TokenError(400));
            }

        } else {
            // No token exists
            return next(new AuthError.TokenError(400));
        }
    }, (err: any) => {
        return next(new AuthError.TokenError(500));
    });
                      
});

// password reset
router.post('/new-password', rateLimiter.newPasswordLimiter, function (req: any, res: any, next: any) {

    const { password, token } = req.body;

    passwordReset.getByToken(token).then( (rows: any) => {

        if ( rows.length > 0 && authentication.isValidToken(rows[0]) ) {

            const passwordError = authentication.validPassword(password);
            if ( passwordError) {
                return next(passwordError);
            }

            const salt = authentication.generateSalt();
            const hash = authentication.hashPassword(password, salt);

            accounts.changePassword( rows[0].account_id, hash, salt ).then( (r: any) => {
                res.status(200).send({ reset: true });
            }, (err: any) => {
                return next(new AuthError.PasswordResetError(500));
            });

        } else {
            // Either no token , or expired
            return next(new AuthError.PasswordResetError(500));
        }
    }, (err: any) => {
        return next(new AuthError.PasswordResetError(500));
    });
                      
});

export = router;
