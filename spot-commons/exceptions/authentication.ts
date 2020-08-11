import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const AUTHENTICATION_ERROR_MESSAGES = ERROR_MESSAGES.PRE_AUTH.AUTHENTICATION;

export class AuthenticationError extends SpotError {
  constructor(statusCode) {
    super(AUTHENTICATION_ERROR_MESSAGES.NO_AUTHENTICATION, statusCode);
    this.name = "AuthenticationError";
  }
}

export class VerifyError extends SpotError {
  constructor(statusCode) {
    super(AUTHENTICATION_ERROR_MESSAGES.VERIFY, statusCode);
    this.name = "AccountNotVerified";
  }
}

// Validation Auth Errors for signup

// Username
export class UsernameLengthError extends SpotError {
  constructor(statusCode, minLength, maxLength) {
    super(AUTHENTICATION_ERROR_MESSAGES.USERNAME_LENGTH, statusCode);
    this.name = "UsernameLengthError";
    this.body = { min: minLength, max: maxLength };
  }
}

export class UsernameCharacterError extends SpotError {
  constructor(statusCode) {
    super(AUTHENTICATION_ERROR_MESSAGES.USERNAME_CHARACTER, statusCode);
    this.name = "UsernameCharacterError";
  }
}

export class UsernameTakenError extends SpotError {
  constructor(statusCode) {
    super(AUTHENTICATION_ERROR_MESSAGES.USERNAME_TAKEN, statusCode);
    this.name = "UsernameTakenError";
  }
}

// Password
export class PasswordLengthError extends SpotError {
  constructor(statusCode, minLength, maxLength) {
    super(AUTHENTICATION_ERROR_MESSAGES.PASSWORD_LENGTH, statusCode);
    this.name = "PasswordLengthError";
    this.body = { min: minLength, max: maxLength };
  }
}

// Email
export class EmailTakenError extends SpotError {
  constructor(statusCode) {
    super(AUTHENTICATION_ERROR_MESSAGES.EMAIL_TAKEN, statusCode);
    this.name = "EmailTakenError";
  }
}

export class EmailInvalidError extends SpotError {
  constructor(statusCode) {
    super(AUTHENTICATION_ERROR_MESSAGES.EMAIL_INVALID, statusCode);
    this.name = "EmailInvalidError";
  }
}

// Phone
export class PhoneTakenError extends SpotError {
  constructor(statusCode) {
    super(AUTHENTICATION_ERROR_MESSAGES.PHONE_TAKEN, statusCode);
    this.name = "PhoneTakenError";
  }
}

export class PhoneInvalidError extends SpotError {
  constructor(statusCode) {
    super(AUTHENTICATION_ERROR_MESSAGES.PHONE_INVALID, statusCode);
    this.name = "PhoneInvalidError";
  }
}

// Login Auth Errors

// If account doesnt exist or password is wrong
export class UsernameOrPasswordError extends SpotError {
  constructor(statusCode) {
    super(AUTHENTICATION_ERROR_MESSAGES.USERNAME_OR_PASSWORD, statusCode);
    this.name = "UsernameOrPasswordError";
  }
}
