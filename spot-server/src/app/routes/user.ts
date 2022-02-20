import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

import { pbkdf2Sync } from 'crypto';

// db
import accounts from '@db/accounts.js';
import verifyAccount from '@db/verifyAccount.js';
import prismaUser from '@db/../prisma/user.js';

// services
import authenticationService from '@services/authentication/authentication.js';
import authorization from '@services/authorization/authorization.js';
import friendsService from '@services/friends.js';
import mail from '@services/mail.js';

// exceptions
import * as AuthenticationError from '@exceptions/authentication.js';
import * as AccountsError from '@exceptions/accounts.js';
import * as userError from '@exceptions/user.js';
import ErrorHandler from '@helpers/errorHandler.js';

// models
import {
  UserRole,
  DeleteUserResponse,
  GetUserResponse,
  UpdateUsernameRequest,
  UpdateUsernameResponse,
  UpdateEmailRequest,
  UpdateEmailResponse,
  UpdatePhoneRequest,
  UpdatePhoneResponse,
  FacebookConnectRequest,
  FacebookConnectResponse,
  FacebookDisconnectResponse,
  GoogleConnectRequest,
  GoogleConnectResponse,
  GoogleDisconnectResponse
} from '@models/../newModels/user.js';
import {
  GetUserMetadataResponse,
  UpdateUserMetadataRequest,
  UpdateUserMetadataResponse
} from '@models/../newModels/userMetadata.js'

router.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

// Get user client information
router.get(
  '/',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      if (!userId) {
        return next(new userError.GetUser());
      }
      const foundUser = await prismaUser.findUserById(userId);

      if (!foundUser) {
        return next(new userError.GetUser());
      }

      const response: GetUserResponse = { user: foundUser };
      res.status(200).json(response);
    }
  )
);

// Soft deletes the user account
router.delete(
  '/',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      // Make sure the account is not a guest account
      if (authorization.checkRole(req.user, [UserRole.GUEST]) || !userId) {
        return next(new userError.DeleteUser());
      }
      await prismaUser.softDeleteUser(userId);
      const deleteUserResponse: DeleteUserResponse = {};
      res.status(200).send(deleteUserResponse);
    }
  )
);

// Update username
router.put(
  '/username',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      const body: UpdateUsernameRequest = req.body;

      // Not a guest, and we have the user
      if (authorization.checkRole(req.user, [UserRole.GUEST]) || !userId) {
        return next(new userError.UpdateUsername());
      }

      // Make sure the username is valid, time is correct, and not taken
      const usernameError = authenticationService.validUsername(body.username);
      if (usernameError) {
        return next(usernameError);
      }
      const user = await prismaUser.findUserById(userId);
      if (!user) {
        return next(new userError.UpdateUsername());
      }
      const valid = authenticationService.isValidUserUpdateTime(
        user.usernameUpdatedAt
      );
      if (!valid) {
        return next(new userError.UpdateUsernameTimeout());
      }
      const exists = await prismaUser.usernameExists(body.username);
      if (exists) {
        return next(new AuthenticationError.UsernameTakenError(400));
      }

      const updatedUser = await prismaUser.updateUsername(
        userId,
        body.username
      );
      if (!updatedUser) {
        return next(new userError.UpdateUsername());
      }
      const response: UpdateUsernameResponse = { user: updatedUser };
      res.status(200).json(response);
    }
  )
);

// Update email
router.put(
  '/email',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      const body: UpdateEmailRequest = req.body;

      if (authorization.checkRole(req.user, [UserRole.GUEST]) || !userId) {
        return next(new userError.UpdateEmail());
      }

      // Make sure email is valid, time is correct and not taken
      const emailError = authenticationService.validEmail(body.email);
      if (emailError) {
        return next(emailError);
      }
      const user = await prismaUser.findUserById(userId);
      if (!user) {
        return next(new AccountsError.UpdateEmail(500));
      }
      const valid = authenticationService.isValidUserUpdateTime(
        user.emailUpdatedAt
      );
      if (!valid) {
        return next(new AccountsError.UpdateEmailTimeout(500));
      }
      const exists = await prismaUser.emailExists(body.email);
      if (exists) {
        return next(new AuthenticationError.EmailTakenError(400));
      }

      const updatedUser = await prismaUser.updateEmail(userId, body.email);
      if (!updatedUser) {
        return next(new AccountsError.UpdateEmail(500));
      }
      const response: UpdateEmailResponse = { user: updatedUser };
      res.status(200).json(response);
    }
  )
);

// Update phone
router.put(
  '/phone',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      const body: UpdatePhoneRequest = req.body;

      // Not a guest and we have the user
      if (authorization.checkRole(req.user, [UserRole.GUEST]) || !userId) {
        return next(new userError.UpdatePhone());
      }

      // make sure phone is valid, time is correct and not taken
      const phoneError = authenticationService.validPhone(body.phone);
      if (phoneError) {
        return next(phoneError);
      }
      const user = await prismaUser.findUserById(userId);
      if (!user) {
        return next(new userError.UpdatePhone());
      }
      const valid = authenticationService.isValidUserUpdateTime(
        user.phoneUpdatedAt
      );
      if (!valid) {
        return next(new userError.UpdatePhoneTimeout());
      }
      const exists = await prismaUser.phoneExists(body.phone);
      if (!exists) {
        return next(new AuthenticationError.PhoneTakenError(400));
      }

      const updatedUser = await prismaUser.updatePhone(userId, body.phone);
      if (!updatedUser) {
        return next(new userError.UpdatePhone());
      }
      const response: UpdatePhoneResponse = { user: updatedUser };
      res.status(200).json(response);
    }
  )
);

// Facebook Connect
router.post(
  '/facebook',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const body: FacebookConnectRequest = req.body;
      const userId = req.user?.userId;

      // Not a guest, and we have the user
      if (authorization.checkRole(req.user, [UserRole.GUEST]) || !userId) {
        return next(new userError.FacebookConnect());
      }

      // convert the token to the facebookId
      const facebookId = await authenticationService.getFacebookId(
        body.accessToken
      );
      if (!facebookId) {
        return next(new userError.FacebookConnect());
      }
      const user = await prismaUser.findUserByFacebookId(facebookId.body.id);
      if (user) {
        // the account already exists
        return next(new userError.FacebookConnectExists());
      }
      // create the account
      const connectedUser = await prismaUser.connectFacebook(
        userId,
        facebookId.body.id
      );
      if (!connectedUser) {
        return next(new userError.FacebookConnect());
      }

      // This can run in the background
      friendsService.addFacebookFriends(body.accessToken, userId);

      const response: FacebookConnectResponse = {
        user: connectedUser
      };
      res.status(200).json(response);
    }
  )
);

router.post(
  '/facebook/disconnect',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;

      // Not a guest and we have the user
      if (authorization.checkRole(req.user, [UserRole.GUEST]) || !userId) {
        return next(new userError.FacebookDisconnect());
      }

      // remove the facebook id from the user
      const updatedUser = await prismaUser.disconnectFacebook(userId);
      if (!updatedUser) {
        return next(new userError.FacebookDisconnect());
      }
      const response: FacebookDisconnectResponse = {
        user: updatedUser
      };
      res.status(200).send(response);
    }
  )
);

// Google Connect
router.post(
  '/google',
  ErrorHandler.catchAsync(async function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const body: GoogleConnectRequest = req.body;
    const userId = req.user?.userId;

    if (authorization.checkRole(req.user, [UserRole.GUEST]) || !userId) {
      return next(new userError.GoogleConnect());
    }

    const ticket = await authenticationService.verifyGoogleIdToken(
      body.accessToken
    );

    const payload = ticket.getPayload();
    const googleId = payload['sub'];

    const user = await prismaUser.findUserByGoogleId(googleId);
    if (user) {
      // user already exists
      return next(new userError.GoogleConnectExists());
    }
    // create the account
    const connectedUser = await prismaUser.connectGoogle(userId, googleId);
    if (!connectedUser) {
      return next(new userError.GoogleConnect());
    }

    const response: GoogleConnectResponse = {
      user: connectedUser
    };
    res.status(200).json(response);
  })
);

router.post(
  '/google/disconnect',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;

      if (authorization.checkRole(req.user, [UserRole.GUEST]) || !userId) {
        return next(new userError.GoogleDisconnect());
      }

      // remove the google id from the account
      const user = await prismaUser.disconnectGoogle(userId);
      if (!user) {
        return next(new userError.GoogleDisconnect());
      }

      const response: GoogleDisconnectResponse = {
        user: user
      };
      res.status(200).send(response);
    }
  )
);

// Get account metadata
router.get('/metadata', ErrorHandler.catchAsync(async (req: any, res: any, next: any) => {
  const userId = req.user?.userId;

  if (!userId) {
      return next(new userError.GetMetadata());
  }

  // Get account metadata
  accounts.getAccountMetadata(userId).then(
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
}));

router.put(
  '/metadata',
  ErrorHandler.catchAsync(async function (req: any, res: any, next: any) {
    const accountId = req.user.id;

    if (authorization.checkRole(req.user, [UserRole.GUEST])) {
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

    if (authorization.checkRole(req.user, [UserRole.GUEST])) {
      return next(new AccountsError.SendVerify(500));
    }

    if (!req.user.email) {
      return next(new AccountsError.SendVerify(500));
    }

    // send email with nodemailerm using aws ses transport
    // TODO, ERROR HANDLE THIS AND OTHER MAIL

    await mail.email.send({
      template: 'verify',
      message: {
        from: 'spottables.app@gmail.com',
        to: req.user.email
      },
      locals: {
        link: 'https://spottables.com/verify/' + token,
        username: req.user.username
      }
    });

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

  if (authorization.checkRole(req.user, [UserRole.GUEST])) {
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
