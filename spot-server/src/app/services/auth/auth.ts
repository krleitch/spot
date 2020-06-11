export { generateSalt, hashPassword, validatePassword, generateToken, getFacebookDetails, getFacebookId, validUsername,
            validPassword, optionalAuth }

const { randomBytes, pbkdf2Sync } = require('crypto');
const jwt = require('jsonwebtoken');
const request = require('request');
const passport = require('@services/auth/passport');

const secret = require('../../../../secret.json');

const AuthError = require('@exceptions/authentication');
const ERROR_MESSAGES = require('@exceptions/messages');
const AUTH_ERROR_MESSAGES = ERROR_MESSAGES.ERROR_MESSAGES.PRE_AUTH.AUTHENTICATION;

// Register Validation

function validUsername(username: string): Error | null {

    const MIN_LENGTH = 4;
    const MAX_LENGTH = 32;
    // start with alphanumeric_ word with . - ' singular no repetition and not at end
    const PATTERN = /^\w(?:\w*(?:['.-]\w+)?)*$/;

    // Check length
    if ( username.length < MIN_LENGTH || username.length > MAX_LENGTH ) {
        return new AuthError.UsernameLengthError(AUTH_ERROR_MESSAGES.USERNAME_LENGTH, 400, MIN_LENGTH, MAX_LENGTH);
    }

    // Check characters
    if ( username.match(PATTERN) == null ) {
        return new AuthError.UsernameCharacterError(AUTH_ERROR_MESSAGES.USERNAME_CHARACTER, 400)
    }

    return null;

}

function validPassword(password: string): Error | null {

    const MIN_LENGTH = 8;
    const MAX_LENGTH = 255;

    // Check length
    if ( password.length < MIN_LENGTH || password.length > MAX_LENGTH ) {
        // HASH PASS?
        return new AuthError.PasswordLengthError(AUTH_ERROR_MESSAGES.PASSWORD_LENGTH, 400, MIN_LENGTH, MAX_LENGTH);
    }

    return null;

}

// Optional Authentication Middleware
const optionalAuth = function(req: any, res: any, next: any) {
    passport.authenticate('jwt', {session: true} , function(err: any, user: any, info: any) {
      req.authenticated = !! user;
      req.user = user || null;
      next();
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
    return jwt.sign({ id: user }, secret.secret);
}

// Facebook

function getFacebookDetails(accessToken: String): Promise<any> {
    
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

function getFacebookId(accessToken: String): Promise<any> {
    
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
