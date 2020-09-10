const express = require('express');
const router = express.Router();

const { pbkdf2Sync } = require('crypto');

// db
const accounts = require('@db/accounts');
const verifyAccount = require('@db/verifyAccount');

// services
const authService = require('@services/authentication/authentication');
const friendsService = require('@services/friends');
const mail = require('@services/mail');

// exceptions
const AuthError = require('@exceptions/authentication');

router.use(function timeLog (req: any, res: any, next: any) {
    next();
});

router.delete('/', function (req: any, res: any) {
    const accountId = req.user.id;
    accounts.deleteAccount(accountId).then( (rows: any) => {
        res.status(200);   
    }, (err: any) => {
        res.status(500).send('Error deleting account');
    });
})

router.get('/', function (req: any, res: any) {
    const accountId = req.user.id;
    accounts.getAccountById(accountId).then((rows: any) => {
        res.status(200).json({ account: rows[0] });
    }, (err: any) => {
        res.status(500).send("Error getting the account");
    })
})

// Update account infos

router.put('/username', function (req: any, res: any, next: any) {

    const accountId = req.user.id;
    const { username } = req.body;

    const usernameError = authService.validUsername(username);
    if ( usernameError) {
        return next(usernameError);
    }

    accounts.updateUsername(username, accountId).then((rows: any) => {
        const result = { username: rows[0].username };
        res.status(200).json(result);
    }, (err: any) => {

        if ( err.code === 'ER_DUP_ENTRY' ) {

            // get the column name for the duplicate from the message
            const column = err.sqlMessage.match(/'.*?'/g).slice(-1)[0].replace(/[']+/g, '');

            if ( column == 'username' ) {
                return next(new AuthError.UsernameTakenError(400));
            }

        }

        return next(new AuthError.UpdateUsernameError(500));

    });

});

router.put('/email', function (req: any, res: any, next: any) {

    const accountId = req.user.id;
    const { email } = req.body;

    const emailError = authService.validEmail(email);
    if ( emailError) {
        return next(emailError);
    }

    accounts.updateEmail(email, accountId).then((rows: any) => {
        const result = { email: rows[0].email };
        res.status(200).json(result);
    }, (err: any) => {

        if ( err.code === 'ER_DUP_ENTRY' ) {

            // get the column name for the duplicate from the message
            const column = err.sqlMessage.match(/'.*?'/g).slice(-1)[0].replace(/[']+/g, '');

            if ( column == 'email' ) {
                return next(new AuthError.EmailTakenError(400));
            }

        }

        // return next(new AuthError.UpdateUsernameError(500));

    });

});

// Update username
router.put('/phone', function (req: any, res: any, next: any) {

    const accountId = req.user.id;
    const { phone } = req.body;

    const phoneError = authService.validPhone(phone);
    if ( phoneError) {
        return next(phoneError);
    }

    accounts.updatePhone(phone, accountId).then((rows: any) => {
        const result = { phone: rows[0].phone };
        res.status(200).json(result);
    }, (err: any) => {

        if ( err.code === 'ER_DUP_ENTRY' ) {

            // get the column name for the duplicate from the message
            const column = err.sqlMessage.match(/'.*?'/g).slice(-1)[0].replace(/[']+/g, '');

            if ( column == 'phone' ) {
                return next(new AuthError.PhoneTakenError(400));
            }

        }

        // return next(new AuthError.UpdateUsernameError(500));

    });

});

// Facebook Connect
router.post('/facebook', function (req: any, res: any) {

    const { accessToken } = req.body;
    const accountId = req.user.id;

    authService.getFacebookId(accessToken).then( ( facebookId: any) => {

        accounts.getFacebookAccount(facebookId.body.id).then(( user: any) => {
            if ( user.length == 0 ) {
                // create the account
                accounts.connectFacebookAccount(facebookId.body.id, accountId).then( (rows: any) => {

                    friendsService.addFacebookFriends(accessToken, accountId).then( (res: any) => {

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
                res.status(500).send('Error connecting account with facebook');
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

// Google Connect
router.post('/google', async function (req: any, res: any) {

    const { accessToken } = req.body;
    const accountId = req.user.id;

    try {

        const ticket = authentication.verifyGoogleIdToken(accessToken);

        const payload = ticket.getPayload();
        const userid = payload['sub'];

        accounts.getGoogleAccount(userid).then(( user: any) => {
            if ( user.length == 0 ) {
                // create the account
                accounts.connectGoogleAccount(userid, accountId).then( (rows: any) => {

                    res.status(200).json({
                        created: false
                    });  

                }, (err: any) => {
                    res.status(500).send('Error connecting account with google');
                });            
            } else {
                // account already exists
                res.status(500).send('Error connecting account with google');
            }
        }, (err: any) => {
            res.status(500).send('Error signing in with google');
        }); 

    } catch (err) {

    }
});

router.post('/google/disconnect', function (req: any, res: any) {

    const accountId = req.user.id;

    // remove the google id from the account

    accounts.disconnectGoogleAccount(accountId).then( (rows: any) => {
        res.sendStatus(200);
    }, (err: any) => {
        res.status(500).send('Error disconnecting account with google');
    });   
  
});

// Account Metadata
router.get('/metadata', function (req: any, res: any) {

    const accountId = req.user.id;

    // Get account metadata
    accounts.getAccountMetadata(accountId).then( (rows: any) => {
        res.status(200).json({ metadata: rows[0] });
    }, (err: any) => {
        res.status(500).send('Error getting account metadata');
    });   
  
});

router.put('/metadata', async function (req: any, res: any) {

    const accountId = req.user.id;

    const { distance_unit, search_type, search_distance } = req.body;

    // We only ever change metadata 1 property at a time right now
    // Will need to be changed later

    if ( distance_unit ) {
        await accounts.updateAccountsMetadataDistanceUnit(accountId, distance_unit).then( (rows: any) => {

        }, (err: any) => {
            res.status(500).send('Error updating distance unit');
        });   
    }
    
    if ( search_type ) {
        await accounts.updateAccountsMetadataSearchType(accountId, search_type).then( (rows: any) => {

        }, (err: any) => {
            res.status(500).send('Error updating search type');
        });   
    }

    if ( search_distance ) {
        await accounts.updateAccountsMetadataSearchDistance(accountId, search_distance).then( (rows: any) => {
        }, (err: any) => {
            
            res.status(500).send('Error updating search distance');
        });   
    }

    // Get account metadata
    accounts.getAccountMetadata(accountId).then( (rows: any) => {
        res.status(200).json({ metadata: rows[0] });
    }, (err: any) => {
        res.status(500).send('Error getting account metadata');
    });   

});

// Verify Account
router.post('/verify', function (req: any, res: any) {

    const accountId = req.user.id;

    const value = new Date().toString() + accountId.toString();
    const iterations = 10000;
    const hashLength = 16;
    const salt = 'salt'
    const digest = 'sha512';
    const token = pbkdf2Sync(value, salt, iterations, hashLength, digest).toString('hex');

    // send email with nodemailer

    mail.transporter.sendMail({
        from: 'krleitch.ca@gmail.com', // TODO: CHANGE
        to: 'krleitch.ca@gmail.com', // TODO: CHANGE
        subject: 'Message',
        text: "Verify account?", // plain text body
        html: "<b>Link: </b>" + 'https://localhost:4200/verify/' + token, // html body
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
            // Add record to verify account
            verifyAccount.addVerifyAccount(accountId, token).then( (rows: any) => {
                res.status(200).json({});
            }, (err: any) => {
                console.log(err, token)
                res.status(500).send('Error sending verify');
            });   
        }

    });
  
});

// Verify Account
router.post('/verify/confirm', function (req: any, res: any) {

    const accountId = req.user.id;

    const { token } = req.body;

    // Add record to verify account
    verifyAccount.getByToken(accountId, token).then( (rows: any) => {

        // TODO: check valid expirary date

        if ( rows.length > 0 ) {

            const verifiedDate = new Date();
            accounts.verifyAccount( rows[0].account_id, verifiedDate ).then( (r: any) => {
                res.status(200).send({ account: r[0] });
            }, (err: any) => {
                console.log(err)
            });

        } else {
            // FIX
            // weird case
            res.status(500).send('Error confirming verify');
        }

    }, (err: any) => {
        res.status(500).send('Error confirming verify');
    });   
  
});

export = router;
