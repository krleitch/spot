import { Request, Response, NextFunction } from 'express';
import { randomBytes, pbkdf2Sync } from 'crypto';
import jwt from 'jsonwebtoken';
import axios, { AxiosResponse } from 'axios';

// config
import secret from '@config/secret.js';

// Google auth
import { LoginTicket, OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(
  '805375534727-tsjtjhrf00a4hnvscrnejj5jaioo2nit.apps.googleusercontent.com'
);

// services
import passport from '@services/authentication/passport.js';

// db
import prismaUser from '@db/prisma/user.js';

// exceptions
import * as authenticationError from '@exceptions/authentication.js';
import { SpotError } from '@exceptions/error.js';

// constants
import { AUTHENTICATION_CONSTANTS } from '@constants/authentication.js';

// models
import { User } from '@models/user.js';

// *************************
// Validation
// *************************

// just check for an @ and a .
const VALID_EMAIL_REGEX = /^\S+@\S+\.\S+$/;
// correct number of digits in either form
const VALID_PHONE_REGEX =
  /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
// alphanumeric starting with a letter (_ and - and . allowed)
const VALID_USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_\-\.]*$/;
// one letter, one number, and one special character
const VALID_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

const validUsername = (username: string): SpotError | null => {
  // Check length
  if (
    username.length < AUTHENTICATION_CONSTANTS.USERNAME_MIN_LENGTH ||
    username.length > AUTHENTICATION_CONSTANTS.USERNAME_MAX_LENGTH
  ) {
    return new authenticationError.UsernameLengthError(
      400,
      AUTHENTICATION_CONSTANTS.USERNAME_MIN_LENGTH,
      AUTHENTICATION_CONSTANTS.USERNAME_MAX_LENGTH
    );
  }

  // Check characters
  if (!username.match(VALID_USERNAME_REGEX)) {
    return new authenticationError.UsernameCharacterError(400);
  }

  return null;
};

const validPassword = (password: string): SpotError | null => {
  // Check length
  if (
    password.length < AUTHENTICATION_CONSTANTS.PASSWORD_MIN_LENGTH ||
    password.length > AUTHENTICATION_CONSTANTS.PASSWORD_MAX_LENGTH
  ) {
    return new authenticationError.PasswordLengthError(
      400,
      AUTHENTICATION_CONSTANTS.PASSWORD_MIN_LENGTH,
      AUTHENTICATION_CONSTANTS.PASSWORD_MAX_LENGTH
    );
  }

  // Check characters
  if (!password.match(VALID_PASSWORD_REGEX)) {
    return new authenticationError.PasswordCharacterError(400);
  }

  return null;
};

const validEmail = (email: string): SpotError | null => {

  if (!email.match(VALID_EMAIL_REGEX)) {
    return new authenticationError.EmailInvalidError(400);
  }

  return null;
};

const validPhone = (phone: string): SpotError | null => {

  if (!phone.match(VALID_PHONE_REGEX)) {
    return new authenticationError.PhoneInvalidError(400);
  }

  return null;
};

// *************************
// Middleware
// *************************

// Optional Authentication Middleware
const optionalAuth = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  passport.authenticate('jwt', { session: false }, (err: any, user: User) => {
    req.user = user || null;
    next();
  })(req, res, next);
};

// Will throw a authentication error if not authenticated
const requiredAuth = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  passport.authenticate('jwt', { session: false }, (err: any, user: User) => {
    req.user = user || null;
    // No user found
    if (!req.user) {
      return next(new authenticationError.AuthenticationError(401));
    } else {
      next();
    }
  })(req, res, next);
};

// Uses a Username/Email and password combination
// Will throw if doesnt exist
const localAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, (err: any, user: User) => {
    req.user = user || null;
    // No user found
    if (!req.user) {
      return next(new authenticationError.UsernameOrPasswordError(401));
    } else {
      next();
    }
  })(req, res, next);
};

// *************************
// Password Generation, Validation, and JWT
// *************************

const generateSalt = (): string => {
  return randomBytes(128).toString('hex');
};

const hashPassword = (password: string, salt: string): string => {
  const iterations = 10000;
  const hashLength = 512;
  const digest = 'sha512';
  return pbkdf2Sync(password, salt, iterations, hashLength, digest).toString(
    'hex'
  );
};

const validatePassword = (
  userHashedPassword: string,
  salt: string,
  password: string
): boolean => {
  const hashedPassword = hashPassword(password, salt);
  return hashedPassword === userHashedPassword;
};

const generateJwtFromUser = (user: User): string => {
  return jwt.sign({ id: user }, secret.secret, { expiresIn: '30d' });
};

// *************************
// Check Times, Create Username
// *************************

const isValidPasswordResetTokenTime = (tokenCreatedAt: Date): boolean => {
  // the constant should be a number in minutes
  const expire = AUTHENTICATION_CONSTANTS.TOKEN_EXPIRE_TIME * 60 * 1000;
  const now = new Date();
  return now.getTime() - tokenCreatedAt.getTime() <= expire;
};

const createUsernameFromEmail = async (
  email: string | null
): Promise<string> => {
  // Try using the email first
  let username;
  if (email) {
    const index = Math.min(email.indexOf('@'), 25);
    username = email.substring(0, index);
  } else {
    username = null;
  }

  if (!username) {
    username = 'user' + (10000 + Math.random() * (99999 - 10000)).toString();
  }

  // Need to make sure the username isn't taken
  let exists = await prismaUser.usernameExists(username);
  do {
    if (exists) {
      // add a random number from 0-9
      username += Math.floor(Math.random() * 10).toString();
      // check again
      exists = await prismaUser.usernameExists(username);
    }
  } while (exists);

  return username;
};

const isValidUserUpdateTime = (updatedTime: Date | null): boolean => {
  // TODO: reimplement this
  // NOTE: if you just created your account with fb you need to chagne username again immediately maybe
  // if (!updatedTime) {
  //   return true;
  // }
  // // the constant is in number of hours
  // const expire =
  //   AUTHENTICATION_CONSTANTS.ACCOUNT_UPDATE_TIMEOUT * 60 * 60 * 1000;
  // const now = new Date();


  // return now.getTime() - updatedTime.getTime() > expire;
  return true;
};

// *************************
// Facebook and Google
// *************************

// Get id, email
type facebookGetDetailResponse = {
  response: AxiosResponse;
  body: { id: string; email: string };
};
const getFacebookDetails = (
  accessToken: string
): Promise<facebookGetDetailResponse> => {
  const url =
    'https://graph.facebook.com/me?fields=id,email&access_token=' + accessToken;

  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        resolve({ response: response, body: JSON.parse(response.data) });
      })
      .catch((error) => {
        return reject(error);
      });
  });
};

// Only get id
type facebookGetIdResponse = { response: AxiosResponse; body: { id: string } };
const getFacebookId = (accessToken: string): Promise<facebookGetIdResponse> => {
  const url =
    'https://graph.facebook.com/me?fields=id&access_token=' + accessToken;

  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        resolve({ response: response, body: JSON.parse(response.data) });
      })
      .catch((error) => {
        return reject(error);
      });
  });
};

const verifyGoogleIdToken = async (
  accessToken: string
): Promise<LoginTicket> => {
  const ticket = await client.verifyIdToken({
    idToken: accessToken,
    audience:
      '773867677566-52gc54rg7909514ff2nvvi5oejlg0077.apps.googleusercontent.com'
  });
  return ticket;
};

export default {
  generateSalt,
  hashPassword,
  validatePassword,
  generateJwtFromUser,
  getFacebookDetails,
  getFacebookId,
  validUsername,
  validPassword,
  optionalAuth,
  requiredAuth,
  localAuth,
  validEmail,
  validPhone,
  isValidPasswordResetTokenTime,
  createUsernameFromEmail,
  verifyGoogleIdToken,
  isValidUserUpdateTime
};
