import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

import shortid from 'shortid';
import { validate as validateUuid }  from 'uuid';

// exceptions
import * as authenticationError from '@exceptions/authentication.js';
import ErrorHandler from '@helpers/errorHandler.js';

// db
import prismaUser from '@db/prisma/user.js';
import prismaPasswordReset from '@db/prisma/passwordReset.js';

// services
import authenticationService from '@services/authentication/authentication.js';
import authorizationService from '@services/authorization.js';
import friendsService from '@services/friends.js';
import mailService from '@services/mail.js';

// ratelimiter
import rateLimiter from '@helpers/rateLimiter.js';

// models
import { UserRole } from '@models/user.js';
import {
  RegisterRequest,
  RegisterResponse,
  LoginResponse,
  FacebookLoginRequest,
  FacebookLoginResponse,
  GoogleLoginRequest,
  GoogleLoginResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  NewPasswordRequest,
  NewPasswordResponse
} from '@models/authentication.js';

router.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

// Create a new user
router.post(
  '/register',
  rateLimiter.authenticationLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const body: RegisterRequest = req.body;

      // Validation
      const emailError = authenticationService.validEmail(body.email);
      if (emailError) {
        return next(emailError);
      }
      const usernameError = authenticationService.validUsername(body.username);
      if (usernameError) {
        return next(usernameError);
      }
      const passwordError = authenticationService.validPassword(body.password);
      if (passwordError) {
        return next(passwordError);
      }
      const phoneError = authenticationService.validPhone(body.phone);
      if (phoneError) {
        return next(phoneError);
      }

      // Db check existance for email, username, phone
      const emailExists = await prismaUser.emailExists(body.email);
      if (emailExists) {
        return next(new authenticationError.EmailTakenError(400));
      }
      const usernameExists = await prismaUser.usernameExists(body.username);
      if (usernameExists) {
        return next(new authenticationError.UsernameTakenError(400));
      }
      const phoneExists = await prismaUser.phoneExists(body.phone);
      if (phoneExists) {
        return next(new authenticationError.PhoneTakenError(400));
      }

      const salt = authenticationService.generateSalt();
      const passwordHash = authenticationService.hashPassword(
        body.password,
        salt
      );

      const user = await prismaUser.createUser(
        body.email,
        body.username,
        passwordHash,
        body.phone,
        salt
      );
      if (!user) {
        return next(new authenticationError.RegisterError());
      }

      const token = authenticationService.generateJwtFromUser(user);
      const response: RegisterResponse = {
        jwt: { token: token, expiresIn: 30 },
        user: user
      };
      res.status(200).json(response);
    }
  )
);

// Get a user token, use passport local authentication
router.post(
  '/login',
  rateLimiter.authenticationLimiter,
  authenticationService.localAuth,
  function (req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    if (!user) {
      return next(new authenticationError.LoginError());
    }

    const token = authenticationService.generateJwtFromUser(user);
    const response: LoginResponse = {
      jwt: { token: token, expiresIn: 30 },
      user: user
    };
    res.status(200).json(response);
  }
);

// Facebook login
router.post(
  '/login/facebook',
  rateLimiter.authenticationLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const body: FacebookLoginRequest = req.body;

      if (!req.body) {
        return next(new authenticationError.FacebookSignUpError());
      }

      const facebookDetails = await authenticationService.getFacebookDetails(
        body.accessToken
      );
      if (!facebookDetails) {
        return next(new authenticationError.FacebookSignUpError());
      }
      const facebookUser = await prismaUser.findUserByFacebookId(
        facebookDetails.body.id
      );
      if (!facebookUser) {
        // Create the user
        const username = await authenticationService.createUsernameFromEmail(
          facebookDetails.body.email
        );
        // check if email exists first
        let email: string | null = facebookDetails.body.email;
        const emailExists = await prismaUser.emailExists(email);
        if (emailExists) {
          email = null;
        }
        const createdUser = await prismaUser.createFacebookUser(
          facebookDetails.body.id,
          email,
          username
        );
        if (!createdUser) {
          return next(new authenticationError.FacebookSignUpError());
        }
        // add facebook friends
        friendsService.addFacebookFriends(body.accessToken, createdUser.userId);
        // return the user
        const token = authenticationService.generateJwtFromUser(createdUser);
        const response: FacebookLoginResponse = {
          created: true,
          jwt: { token: token, expiresIn: 30 },
          user: createdUser
        };
        res.status(200).json(response);
      } else {
        // User already exists
        const token = authenticationService.generateJwtFromUser(facebookUser);
        const response: FacebookLoginResponse = {
          created: false,
          jwt: { token: token, expiresIn: 30 },
          user: facebookUser
        };
        res.status(200).json(response);
      }
    }
  )
);

// Google Login
router.post(
  '/login/google',
  rateLimiter.authenticationLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const body: GoogleLoginRequest = req.body;

      try {
        const ticket = await authenticationService.verifyGoogleIdToken(
          body.accessToken
        );
        const payload = ticket.getPayload();
        if (!payload) {
          return next(new authenticationError.GoogleSignUpError());
        }
        const googleid = payload['sub'];

        const googleUser = await prismaUser.findUserByGoogleId(googleid);
        if (!googleUser) {
          // create the user
          let email = payload['email'] || null;
          const username = await authenticationService.createUsernameFromEmail(
            email
          );
          const emailExists = !email || (await prismaUser.emailExists(email));
          if (emailExists) {
            email = null;
          }

          const createdUser = await prismaUser.createGoogleUser(
            googleid,
            email,
            username
          );
          if (!createdUser) {
            return next(new authenticationError.GoogleSignUpError());
          }
          const token = authenticationService.generateJwtFromUser(createdUser);
          const response: GoogleLoginResponse = {
            created: true,
            jwt: { token: token, expiresIn: 30 },
            user: createdUser
          };
          res.status(200).json(response);
        } else {
          // The user already exists
          const token = authenticationService.generateJwtFromUser(googleUser);
          const response: GoogleLoginResponse = {
            created: false,
            jwt: { token: token, expiresIn: 30 },
            user: googleUser
          };
          res.status(200).json(response);
        }
      } catch (err) {
        return next(new authenticationError.GoogleSignUpError());
      }
    }
  )
);

// password reset
router.post(
  '/password-reset',
  rateLimiter.passwordResetLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const body: PasswordResetRequest = req.body;

      // return immediately so we give no information on what emails exist
      const response: PasswordResetResponse = {};
      res.status(200).send(response);

      const user = await prismaUser.findUserByEmail(body.email);
      if (user && user.email) {
        // generate the token
        const token = shortid.generate();

        const passwordReset = await prismaPasswordReset.createPasswordReset(
          user.userId,
          token
        );

        // Send email with nodemailer and aws ses transport
        try {
          await mailService.email.send({
            template: 'password',
            message: {
              from: 'spottables.com@gmail.com',
              to: user.email
            },
            locals: {
              link: `https://spottables.com/new-password/${passwordReset.link}`,
              token: passwordReset.token,
              username: user.username
            }
          });
        } catch (e) {}
      }
    }
  )
);

// checks if a token for password reset exists and is valid
router.post(
  '/new-password/validate',
  rateLimiter.tokenLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const body: ValidateTokenRequest = req.body;

      if (!validateUuid(body.link)) {
        return next(new authenticationError.PasswordResetValidate());
      }

      const passwordReset = await prismaPasswordReset.findByTokenAndLink(
        body.token,
        body.link
      );
      if (!passwordReset) {
        return next(new authenticationError.PasswordResetValidate());
      }
      if (
        authenticationService.isValidPasswordResetTokenTime(
          passwordReset.createdAt
        )
      ) {
        const response: ValidateTokenResponse = {};
        res.status(200).send(response);
      } else {
        // Token expired
        return next(new authenticationError.PasswordResetValidate());
      }
    }
  )
);

// password reset
router.post(
  '/new-password',
  rateLimiter.newPasswordLimiter,
  ErrorHandler.catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const body: NewPasswordRequest = req.body;

      if (!validateUuid(body.link)) {
        return next(new authenticationError.NewPassword());
      }

      const passwordReset = await prismaPasswordReset.findByTokenAndLink(
        body.token,
        body.link
      );
      if (!passwordReset) {
        return next(new authenticationError.NewPassword());
      }
      if (
        !authenticationService.isValidPasswordResetTokenTime(
          passwordReset.createdAt
        )
      ) {
        return next(new authenticationError.NewPassword());
      }

      // validate the password
      const passwordError = authenticationService.validPassword(body.password);
      if (passwordError) {
        return next(passwordError);
      }

      const salt = authenticationService.generateSalt();
      const passwordHash = authenticationService.hashPassword(
        body.password,
        salt
      );

      const user = await prismaUser.findUserById(passwordReset.userId);
      if (!user) {
        return next(new authenticationError.NewPassword());
      }
      if (authorizationService.checkUserHasRole(user, [UserRole.GUEST])) {
        return next(new authenticationError.NewPassword());
      }

      const updatedUser = await prismaUser.updatePassword(
        user.userId,
        passwordHash,
        salt
      );
      if (!updatedUser) {
        return next(new authenticationError.NewPassword());
      }
      const response: NewPasswordResponse = {};
      res.status(200).send(response);
    }
  )
);

export default router;
