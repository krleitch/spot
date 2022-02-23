import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

import { pbkdf2Sync } from 'crypto';

// db
import prismaUser from '@db/../prisma/user.js';
import prismaUserMetadata from '@db/../prisma/userMetadata.js';
import prismaUserVerify from '@db/../prisma/userVerify.js';

// services
import authenticationService from '@services/authentication/authentication.js';
import authorization from '@services/authorization/authorization.js';
import friendsService from '@services/friends.js';
import mail from '@services/mail.js';

// exceptions
import * as authenticationError from '@exceptions/authentication.js';
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
  GoogleDisconnectResponse,
  VerifyConfirmRequest,
  VerifyConfirmResponse,
  VerifyResponse
} from '@models/../newModels/user.js';
import {
  UserMetadata,
  GetUserMetadataResponse,
  UpdateUserMetadataRequest,
  UpdateUserMetadataResponse
} from '@models/../newModels/userMetadata.js';

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
        return next(new authenticationError.UsernameTakenError(400));
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
        return next(new userError.UpdateEmail());
      }
      const valid = authenticationService.isValidUserUpdateTime(
        user.emailUpdatedAt
      );
      if (!valid) {
        return next(new userError.UpdateEmailTimeout());
      }
      const exists = await prismaUser.emailExists(body.email);
      if (exists) {
        return next(new authenticationError.EmailTakenError(400));
      }

      const updatedUser = await prismaUser.updateEmail(userId, body.email);
      if (!updatedUser) {
        return next(new userError.UpdateEmail());
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
        return next(new authenticationError.PhoneTakenError(400));
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

// Get user metadata
router.get(
  '/metadata',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;

      if (!userId) {
        return next(new userError.GetMetadata());
      }

      // Get user metadata
      const metadata = await prismaUserMetadata.findUserMetadataByUserId(
        userId
      );
      if (!metadata) {
        return next(new userError.GetMetadata());
      }

      const response: GetUserMetadataResponse = { metadata: metadata };
      res.status(200).json(response);
    }
  )
);

// Update metadata
router.put(
  '/metadata',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;

      if (authorization.checkRole(req.user, [UserRole.GUEST]) || !userId) {
        return next(new userError.GetMetadata());
      }

      const body: UpdateUserMetadataRequest = req.body;
      let updatedMetadata: UserMetadata | null = null;

      // TODO
      // This can be done better

      if (body.unitSystem) {
        const metadata = await prismaUserMetadata.updateUserMetadataUnitSystem(
          userId,
          body.unitSystem
        );
        if (!metadata) {
          return next(new userError.MetadataUnitSystem());
        }
        updatedMetadata = metadata;
      }

      if (body.searchType) {
        const metadata = await prismaUserMetadata.updateUserMetadataSearchType(
          userId,
          body.searchType
        );
        if (!metadata) {
          return next(new userError.MetadataSearchType());
        }
        updatedMetadata = metadata;
      }

      if (body.locationType) {
        const metadata =
          await prismaUserMetadata.updateUserMetadataLocationType(
            userId,
            body.locationType
          );
        if (!metadata) {
          return next(new userError.MetadataLocationType());
        }
        updatedMetadata = metadata;
      }

      if (typeof body.matureFilter !== 'undefined') {
        const metadata =
          await prismaUserMetadata.updateUserMetadataMatureFilter(
            userId,
            body.matureFilter
          );
        if (!metadata) {
          return next(new userError.MetadataMatureFilter());
        }
        updatedMetadata = metadata;
      }

      if (body.themeWeb) {
        const metadata = await prismaUserMetadata.updateUserMetadataThemeWeb(
          userId,
          body.themeWeb
        );
        if (!metadata) {
          return next(new userError.MetadataThemeWeb());
        }
        updatedMetadata = metadata;
      }

      // Nothing was updated
      if (!updatedMetadata) {
        return next(new userError.GetMetadata());
      }

      const response: UpdateUserMetadataResponse = {
        metadata: updatedMetadata
      };
      res.status(200).json(response);
    }
  )
);

// Verify user
// The request for a verification which will send an email
router.post(
  '/verify',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (authorization.checkRole(req.user, [UserRole.GUEST]) || !req.user) {
        return next(new userError.SendVerify());
      }

      // create the token
      const value = new Date().toString() + req.user.userId.toString();
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

      // No email for user
      if (!req.user.email) {
        return next(new userError.SendVerify());
      }

      // Send email with nodemailer using aws ses transport
      // TODO: Error handle and make better

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

      const createdToken = await prismaUserVerify.createVerifyUser(
        req.user.userId,
        token
      );
      if (!createdToken) {
        return next(new userError.SendVerify());
      }
      const response: VerifyResponse = {};
      res.status(200).json(response);
    }
  )
);

// Verify User confirmation using token
router.post(
  '/verify/confirm',
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      const body: VerifyConfirmRequest = req.body;

      if (authorization.checkRole(req.user, [UserRole.GUEST]) || !userId) {
        return next(new userError.ConfirmVerify());
      }

      // Add record to verify account
      const userVerify = await prismaUserVerify.findByToken(body.token);
      if (!userVerify) {
        return next(new userError.ConfirmVerify());
      }

      // check valid expirary date and correct user
      if (
        !authenticationService.isValidTokenTime(userVerify.createdAt) ||
        userVerify.userId !== userId
      ) {
        return next(new userError.ConfirmVerify(499));
      }

      const verifiedUser = await prismaUser.verifyUser(userId);
      if (!verifiedUser) {
        return next(new userError.ConfirmVerify());
      }

      const response: VerifyConfirmResponse = { user: verifiedUser };
      res.status(200).send(response);
    }
  )
);

export default router;
