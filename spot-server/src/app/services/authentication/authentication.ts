export { generateSalt, hashPassword, validatePassword, generateToken, getFacebookDetails, getFacebookId, validUsername,
            validPassword, optionalAuth, requiredAuth, localAuth, validEmail, validPhone, isValidToken, createUsernameFromEmail,
            verifyGoogleIdToken }

const { randomBytes, pbkdf2Sync } = require('crypto');
const jwt = require('jsonwebtoken');
const request = require('request');

// config
const secret = require('@config/secret.json');

// Google auth
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('805375534727-tsjtjhrf00a4hnvscrnejj5jaioo2nit.apps.googleusercontent.com');

// services
const passport = require('@services/authentication/passport');

// db
const accounts = require('@db/accounts');

// exceptions
const AuthenticationError = require('@exceptions/authentication');

// constants
const AUTH_CONSTANTS = require('@constants/authentication');
const AUTHENTICATION_CONSTANTS = AUTH_CONSTANTS.AUTHENTICATION_CONSTANTS

// Registration Validation

function validUsername(username: string): Error | null {

    // Check length
    if ( username.length < AUTHENTICATION_CONSTANTS.MIN_USERNAME_LENGTH ||
         username.length > AUTHENTICATION_CONSTANTS.MAX_USERNAME_LENGTH ) {
        return new AuthenticationError.UsernameLengthError(400, AUTHENTICATION_CONSTANTS.MIN_USERNAME_LENGTH, AUTHENTICATION_CONSTANTS.MAX_USERNAME_LENGTH);
    }

    // start with alphanumeric_ word with . - ' singular no repetition and not at end
    const PATTERN = /^\w(?:\w*(?:['.-]\w+)?)*$/;

    // Check characters
    if ( username.match(PATTERN) == null ) {
        return new AuthenticationError.UsernameCharacterError(400)
    }

    return null;

}

function validPassword(password: string): Error | null {

    // Check length
    if ( password.length < AUTHENTICATION_CONSTANTS.MIN_PASSWORD_LENGTH ||
         password.length > AUTHENTICATION_CONSTANTS.MAX_PASSWORD_LENGTH) {
        return new AuthenticationError.PasswordLengthError(400, AUTHENTICATION_CONSTANTS.MIN_PASSWORD_LENGTH, AUTHENTICATION_CONSTANTS.MAX_PASSWORD_LENGTH);
    }

    return null;

}

function validEmail(email: string): Error | null {

    const regex = /^\S+@\S+\.\S+$/;

    if ( email.match(regex) == null ) {
        return new AuthenticationError.PasswordInvalidError(400);
    }

    return null;

}

function validPhone(phone: string): Error | null {

    const regex = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

    if ( phone.match(regex) == null ) {
        return new AuthenticationError.PhoneInvalidError(400);
    }

    return null;

}

// Optional Authentication Middleware
// has req.authenticated if authenticated
const optionalAuth = function(req: any, res: any, next: any) {
    passport.authenticate('jwt', {session: false} , function(err: any, user: any, info: any) {
      req.authenticated = !! user;
      req.verified = !! user.verified_date;
      req.user = user || null;
      next();
    })(req, res, next);
};

// Will throw a authentication error if not authenticated
const requiredAuth = function(req: any, res: any, next: any) {
    passport.authenticate('jwt', {session: false} , function(err: any, user: any, info: any) {
      req.authenticated = !! user;
      req.verified = !! user.verified_date;
      req.user = user || null;
      if ( ! req.authenticated ) {
        return next(new AuthenticationError.AuthenticationError(401));
      } else {
          next();
      }
    })(req, res, next);
};

// Uses a Username/Email and password combination
// Will throw if doesnt exist
const localAuth = function(req: any, res: any, next: any) {
    passport.authenticate('local', {session: false} , function(err: any, user: any, info: any) {
      req.authenticated = !! user;
      req.verified = !! user.verified_date;
      req.user = user || null;
      // No user found
      if ( user == false ) {
        return next(new AuthenticationError.UsernameOrPasswordError(401));
      } else {
          next();
      }
    })(req, res, next);
};

// Password Generation

function generateSalt(): string {
    return randomBytes(128).toString('hex');
}

function hashPassword(password: string, salt: string): string {
    const iterations = 10000;
    const hashLength = 512;
    const digest = 'sha512';
    return pbkdf2Sync(password, salt, iterations, hashLength, digest).toString('hex');
}

function validatePassword(user: any, password: string): boolean {
    if (user === undefined) return false;
    const hashedPassword = hashPassword(password, user.salt);
    return hashedPassword === user.pass;
}

function generateToken(user: any): any {
    return jwt.sign({ id: user }, secret.secret, { expiresIn: '2h' });
}

// Password Reset

function isValidToken(token: any): boolean {

    // the constant should be a number in minutes
    const expire = AUTHENTICATION_CONSTANTS.TOKEN_EXPIRE_TIME * 60 * 1000

    const now = new Date();

    return (now.getTime() - new Date(token.creation_date).getTime()) <= expire;

}

async function createUsernameFromEmail(email: string): Promise<string> {

    // Try using the email first
    const index = email.indexOf('@');
    let username = email.substring(0, index);

    if ( !username ) {
        username = 'user' + (10000 + (Math.random() * (99999 - 10000))).toString();
    }

    // Need to make sure the username isn't taken
    let exists = await accounts.usernameExists(username);
    
    do {

        if ( exists ) {
            // add a random number from 0-9
            username += Math.floor(Math.random() * 10).toString();
            // check again
            exists = await accounts.usernameExists(username);
        }
        
    } while (exists)

	return username;

}

// Facebook
function getFacebookDetails(accessToken: string): Promise<any> {
    
    const url = "https://graph.facebook.com/me?fields=id,email&access_token=" + accessToken;

    return new Promise((resolve, reject) => {
        request(url, function (error: any, response: any, body: any) {
            if (error) {
                return reject(error);
            }
            resolve({response: response, body: JSON.parse(body)});
          });
    })
}

function getFacebookId(accessToken: string): Promise<any> {
    
    const url = "https://graph.facebook.com/me?fields=id&access_token=" + accessToken;

    return new Promise((resolve, reject) => {
        request(url, function (error: any, response: any, body: any) {
            if (error) {
                return reject(error);
            }
            resolve({response: response, body: JSON.parse(body)});
          });
    })
}

// Google

async function verifyGoogleIdToken(accessToken: string): Promise<any> {
    const ticket = await client.verifyIdToken({
        idToken: accessToken,
        audience: '805375534727-tsjtjhrf00a4hnvscrnejj5jaioo2nit.apps.googleusercontent.com',
        // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    return ticket
}
