import express from 'express';
const router = express.Router();

import { pbkdf2Sync } from 'crypto';

// db
import accounts from '@db/accounts.js';
import verifyAccount from '@db/verifyAccount.js';

// services
import authenticationService from '@services/authentication/authentication.js';
import authorization from '@services/authorization/authorization.js';
import friendsService from '@services/friends.js';
import mail from '@services/mail.js';

// exceptions
import * as AuthenticationError from '@exceptions/authentication.js';
import * as AccountsError from '@exceptions/accounts.js';
import ErrorHandler from '@helpers/errorHandler.js';

// constants
import roles from '@services/authorization/roles.js';

router.use(function timeLog(req: any, res: any, next: any) {
  next();
});

// soft deletes the user account
router.delete('/', function (req: any, res: any, next: any) {
  const accountId = req.user.id;

  if (authorization.checkRole(req.user, [roles.guest])) {
    return next(new AccountsError.DeleteAccount(500));
  }

  accounts.deleteAccount(accountId).then(
    (rows: any) => {
      res.status(200).send({});
    },
    (err: any) => {
      return next(new AccountsError.DeleteAccount(500));
    }
  );
});

// Get account information
router.get('/', function (req: any, res: any, next: any) {
  const accountId = req.user.id;

  accounts.getAccountById(accountId).then(
    (rows: any) => {
      const response = { account: rows[0] };
      res.status(200).json(response);
    },
    (err: any) => {
      return next(new AccountsError.GetAccount(500));
    }
  );
});

// Update username
router.put(
  '/username',
  ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {
    const accountId = req.user.id;
    const { username } = req.body;

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new AccountsError.UpdateUsername(500));
    }

    // Make sure the username is valid
    const usernameError = authenticationService.validUsername(username);
    if (usernameError) {
      return next(usernameError);
    }

    // make sure you haven't updated recently
    try {
      const rows = await accounts.getAccountById(accountId);
      if (rows.length < 1) {
        return next(new AccountsError.UpdateUsername(500));
      }
      const valid = authenticationService.isValidAccountUpdateTime(
        rows[0].username_updated_at
      );
      if (!valid) {
        return next(new AccountsError.UpdateUsernameTimeout(500));
      }
    } catch (e) {
      return next(new AccountsError.UpdateUsername(500));
    }

    accounts.updateUsername(username, accountId).then(
      (rows: any) => {
        if (rows.length < 0) {
          return next(new AccountsError.UpdateUsername(500));
        }
        const result = { username: rows[0].username };
        res.status(200).json(result);
      },
      (err: any) => {
        if (err.code === 'ER_DUP_ENTRY') {
          // get the column name for the duplicate from the message
          const column = err.sqlMessage
            .match(/'.*?'/g)
            .slice(-1)[0]
            .replace(/[']+/g, '');

          if (column == 'username') {
            return next(new AuthenticationError.UsernameTakenError(400));
          }
        }

        return next(new AccountsError.UpdateUsername(500));
      }
    );
  })
);

// Update email
router.put(
  '/email',
  ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {
    const accountId = req.user.id;
    const { email } = req.body;

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new AccountsError.UpdateEmail(500));
    }

    const emailError = authenticationService.validEmail(email);
    if (emailError) {
      return next(emailError);
    }

    // make sure you haven't updated recently
    try {
      const rows = await accounts.getAccountById(accountId);
      if (rows.length < 1) {
        return next(new AccountsError.UpdateEmail(500));
      }
      // If its your first email dont check, from facebook/google login where email is taken
      if (rows[0].email) {
        const valid = authenticationService.isValidAccountUpdateTime(
          rows[0].email_updated_at
        );
        if (!valid) {
          return next(new AccountsError.UpdateEmailTimeout(500));
        }
      }
    } catch (e) {
      return next(new AccountsError.UpdateEmail(500));
    }

    accounts.updateEmail(email, accountId).then(
      (rows: any) => {
        if (rows.length < 0) {
          return next(new AccountsError.UpdateEmail(500));
        }
        const result = { email: rows[0].email };
        res.status(200).json(result);
      },
      (err: any) => {
        if (err.code === 'ER_DUP_ENTRY') {
          // get the column name for the duplicate from the message
          const column = err.sqlMessage
            .match(/'.*?'/g)
            .slice(-1)[0]
            .replace(/[']+/g, '');

          if (column == 'email') {
            return next(new AuthenticationError.EmailTakenError(400));
          }
        }

        return next(new AccountsError.UpdateEmail(500));
      }
    );
  })
);

// Update phone
router.put(
  '/phone',
  ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {
    const accountId = req.user.id;
    const { phone } = req.body;

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new AccountsError.UpdatePhone(500));
    }

    const phoneError = authenticationService.validPhone(phone);
    if (phoneError) {
      return next(phoneError);
    }

    // make sure you haven't updated recently
    try {
      const rows = await accounts.getAccountById(accountId);
      if (rows.length < 1) {
        return next(new AccountsError.UpdatePhone(500));
      }
      const valid = authenticationService.isValidAccountUpdateTime(
        rows[0].phone_updated_at
      );
      if (!valid) {
        return next(new AccountsError.UpdatePhoneTimeout(500));
      }
    } catch (e) {
      return next(new AccountsError.UpdatePhone(500));
    }

    accounts.updatePhone(phone, accountId).then(
      (rows: any) => {
        if (rows.length < 0) {
          return next(new AccountsError.UpdatePhone(500));
        }
        const result = { phone: rows[0].phone };
        res.status(200).json(result);
      },
      (err: any) => {
        if (err.code === 'ER_DUP_ENTRY') {
          // get the column name for the duplicate from the message
          const column = err.sqlMessage
            .match(/'.*?'/g)
            .slice(-1)[0]
            .replace(/[']+/g, '');

          if (column == 'phone') {
            return next(new AuthenticationError.PhoneTakenError(400));
          }
        }

        return next(new AccountsError.UpdatePhone(500));
      }
    );
  })
);

// Facebook Connect
router.post('/facebook', function (req: any, res: any, next: any) {
  const { accessToken } = req.body;
  const accountId = req.user.id;

  if (authorization.checkRole(req.user, [roles.guest])) {
    return next(new AccountsError.FacebookConnect(500));
  }

  authenticationService.getFacebookId(accessToken).then(
    (facebookId: any) => {
      accounts.getFacebookAccount(facebookId.body.id).then(
        (user: any) => {
          if (user.length == 0) {
            // create the account
            accounts.connectFacebookAccount(facebookId.body.id, accountId).then(
              (account: any) => {
                friendsService.addFacebookFriends(accessToken, accountId).then(
                  (added: boolean) => {
                    const response = {
                      account: account[0]
                    };
                    res.status(200).json(response);
                  },
                  (err: any) => {
                    return next(new AccountsError.FacebookConnect(500));
                  }
                );
              },
              (err: any) => {
                return next(new AccountsError.FacebookConnect(500));
              }
            );
          } else {
            // account already exists
            return next(new AccountsError.FacebookConnectExists(500));
          }
        },
        (err: any) => {
          return next(new AccountsError.FacebookConnect(500));
        }
      );
    },
    (err: any) => {
      return next(new AccountsError.FacebookConnect(500));
    }
  );
});

router.post('/facebook/disconnect', function (req: any, res: any, next: any) {
  const accountId = req.user.id;

  if (authorization.checkRole(req.user, [roles.guest])) {
    return next(new AccountsError.FacebookDisconnect(500));
  }

  // remove the facebook id from the account
  accounts.disconnectFacebookAccount(accountId).then(
    (rows: any) => {
      res.status(200).send({});
    },
    (err: any) => {
      return next(new AccountsError.FacebookDisconnect(500));
    }
  );
});

// Google Connect
router.post(
  '/google',
  ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {
    const { accessToken } = req.body;
    const accountId = req.user.id;

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new AccountsError.GoogleConnect(500));
    }

    try {
      const ticket = await authenticationService.verifyGoogleIdToken(accessToken);

      const payload = ticket.getPayload();
      const userid = payload['sub'];

      accounts.getGoogleAccount(userid).then(
        (user: any) => {
          if (user.length == 0) {
            // create the account
            accounts.connectGoogleAccount(userid, accountId).then(
              (account: any) => {
                const response = {
                  account: account[0]
                };
                res.status(200).json(response);
              },
              (err: any) => {
                return next(new AccountsError.GoogleConnect(500));
              }
            );
          } else {
            // account already exists
            return next(new AccountsError.GoogleConnect(500));
          }
        },
        (err: any) => {
          return next(new AccountsError.GoogleConnect(500));
        }
      );
    } catch (err) {
      return next(new AccountsError.GoogleConnect(500));
    }
  })
);

router.post('/google/disconnect', function (req: any, res: any, next: any) {
  const accountId = req.user.id;

  if (authorization.checkRole(req.user, [roles.guest])) {
    return next(new AccountsError.GoogleConnect(500));
  }

  // remove the google id from the account
  accounts.disconnectGoogleAccount(accountId).then(
    (rows: any) => {
      res.status(200).send({});
    },
    (err: any) => {
      return next(new AccountsError.GoogleConnect(500));
    }
  );
});

// Get account metadata
router.get('/metadata', function (req: any, res: any, next: any) {
  const accountId = req.user.id;

  // Get account metadata
  accounts.getAccountMetadata(accountId).then(
    (rows: any) => {
      if (rows.length < 0) {
        return next(new AccountsError.GetMetadata(500));
      }
      const response = { metadata: rows[0] };
      res.status(200).json(response);
    },
    (err: any) => {
      return next(new AccountsError.GetMetadata(500));
    }
  );
});

router.put(
  '/metadata',
  ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {
    const accountId = req.user.id;

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new AccountsError.GetMetadata(500));
    }

    const {
      distance_unit,
      search_type,
      search_distance,
      mature_filter,
      theme_web
    } = req.body;

    // TODO, really dont like the await strategy here
    // We only ever change metadata 1 property at a time right now
    // Will need to be changed later

    if (distance_unit) {
      await accounts
        .updateAccountsMetadataDistanceUnit(accountId, distance_unit)
        .then(
          (rows: any) => {},
          (err: any) => {
            return next(new AccountsError.MetadataDistanceUnit(500));
          }
        );
    }

    if (search_type) {
      await accounts
        .updateAccountsMetadataSearchType(accountId, search_type)
        .then(
          (rows: any) => {},
          (err: any) => {
            return next(new AccountsError.MetadataSearchType(500));
          }
        );
    }

    if (search_distance) {
      await accounts
        .updateAccountsMetadataSearchDistance(accountId, search_distance)
        .then(
          (rows: any) => {},
          (err: any) => {
            return next(new AccountsError.MetadataSearchDistance(500));
          }
        );
    }

    if (typeof mature_filter !== 'undefined') {
      await accounts
        .updateAccountsMetadataMatureFilter(accountId, mature_filter)
        .then(
          (rows: any) => {},
          (err: any) => {
            return next(new AccountsError.MetadataMatureFilter(500));
          }
        );
    }

    if (theme_web) {
      await accounts.updateAccountsMetadataThemeWeb(accountId, theme_web).then(
        (rows: any) => {},
        (err: any) => {
          return next(new AccountsError.MetadataThemeWeb(500));
        }
      );
    }

    // Get account metadata
    accounts.getAccountMetadata(accountId).then(
      (rows: any) => {
        if (rows.length < 0) {
          return next(new AccountsError.GetMetadata(500));
        }
        const response = { metadata: rows[0] };
        res.status(200).json(response);
      },
      (err: any) => {
        return next(new AccountsError.GetMetadata(500));
      }
    );
  })
);

// Verify Account - Send email
router.post(
  '/verify',
  ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {
    const accountId = req.user.id;

    const value = new Date().toString() + accountId.toString();
    const iterations = 10000;
    const hashLength = 16;
    const salt = 'salt';
    const digest = 'sha512';
    const token = pbkdf2Sync(
      value,
      salt,
      iterations,
      hashLength,
      digest
    ).toString('hex');

    if (authorization.checkRole(req.user, [roles.guest])) {
      return next(new AccountsError.SendVerify(500));
    }

    if (!req.user.email) {
      return next(new AccountsError.SendVerify(500));
    }

    // send email with nodemailerm using aws ses transport
    // TODO, ERROR HANDLE THIS AND OTHER MAIL

    await mail.email.send(
      {
        template: 'verify',
        message: {
          from: 'spottables.app@gmail.com',
          to: req.user.email
        },
        locals: {
          link: 'https://spottables.com/verify/' + token,
          username: req.user.username
        }
      }
    );

    verifyAccount.addVerifyAccount(accountId, token).then(
      (rows: any) => {
        res.status(200).json({});
      },
      (err: any) => {
        return next(new AccountsError.SendVerify(500));
      }
    );
  })
);

// Verify Account confirmation
router.post('/verify/confirm', function (req: any, res: any, next: any) {
  const accountId = req.user.id;
  const { token } = req.body;

  if (authorization.checkRole(req.user, [roles.guest])) {
    return next(new AccountsError.ConfirmVerify(500));
  }

  // Add record to verify account
  verifyAccount.getByToken(accountId, token).then(
    (rows: any) => {
      if (rows.length > 0) {
        // check valid expirary date
        if (!authenticationService.isValidToken(rows[0])) {
          return next(new AccountsError.ConfirmVerify(499));
        }

        const verifiedDate = new Date();
        accounts.verifyAccount(rows[0].account_id, verifiedDate).then(
          (r: any) => {
            const response = { account: r[0] };
            res.status(200).send(response);
          },
          (err: any) => {
            return next(new AccountsError.ConfirmVerify(500));
          }
        );
      } else {
        return next(new AccountsError.ConfirmVerify(500));
      }
    },
    (err: any) => {
      return next(new AccountsError.ConfirmVerify(500));
    }
  );
});

export default router;
