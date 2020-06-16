import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const AUTHENTICATION_ERROR_MESSAGES = ERROR_MESSAGES.PRE_AUTH.AUTHENTICATION;

export class AuthenticationError extends SpotError {
  constructor(statusCode) {
    super(AUTHENTICATION_ERROR_MESSAGES.NO_AUTHENTICATION, statusCode);
    this.name = "AuthenticationError";
  }
}

// Validation Auth Errors for signup

// Username
export class UsernameLengthError extends SpotError {
  constructor(message, statusCode, minLength, maxLength) {
    super(message, statusCode);
    this.name = "UsernameLengthError";
    this.body = { min: minLength, max: maxLength };
  }
}

export class UsernameCharacterError extends SpotError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = "UsernameCharacterError";
  }
}


export class UsernameTakenError extends SpotError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = "UsernameTakenError";
  }
}

// Password
export class PasswordLengthError extends SpotError {
  constructor(message, statusCode, minLength, maxLength) {
    super(message, statusCode);
    this.name = "PasswordLengthError";
    this.body = { min: minLength, max: maxLength };
  }
}

// Email
export class EmailTakenError extends SpotError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = "EmailTakenError";
  }
}

export class EmailInvalidError extends SpotError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = "EmailInvalidError";
  }
}

// Phone
export class PhoneTakenError extends SpotError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = "PhoneTakenError";
  }
}

export class PhoneInvalidError extends SpotError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = "PhoneInvalidError";
  }
}

// Login Auth Errors

// If account doesnt exist or password is wrong
export class UsernameOrPasswordError extends SpotError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = "UsernameOrPasswordError";
  }
}
