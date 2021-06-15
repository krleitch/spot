import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const AUTHENTICATION_ERROR_MESSAGES = ERROR_MESSAGES.PRE_AUTH.AUTHENTICATION;

// Most General Error Classes

// The user is not authenticated
export class AuthenticationError extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.NO_AUTHENTICATION, statusCode);
    this.name = "AuthenticationError";
  }
}

// Account email is not verified
export class VerifyError extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.VERIFY, statusCode);
    this.name = "VerifyError";
  }
}

// Validation Auth Errors for signup

export class Register extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.REGISTER, statusCode);
    this.name = "Register";
  }
}

export class UsernameLengthError extends SpotError {
  constructor(statusCode: number, minLength: number, maxLength: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.USERNAME_LENGTH, statusCode);
    this.name = "UsernameLengthError";
    this.body = { min: minLength, max: maxLength };
  }
}

export class UsernameCharacterError extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.USERNAME_CHARACTER, statusCode);
    this.name = "UsernameCharacterError";
  }
}

export class UsernameTakenError extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.USERNAME_TAKEN, statusCode);
    this.name = "UsernameTakenError";
  }
}

export class PasswordLengthError extends SpotError {
  constructor(statusCode: number, minLength: number, maxLength: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.PASSWORD_LENGTH, statusCode);
    this.name = "PasswordLengthError";
    this.body = { min: minLength, max: maxLength };
  }
}

export class EmailTakenError extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.EMAIL_TAKEN, statusCode);
    this.name = "EmailTakenError";
  }
}

export class EmailInvalidError extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.EMAIL_INVALID, statusCode);
    this.name = "EmailInvalidError";
  }
}

export class PhoneTakenError extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.PHONE_TAKEN, statusCode);
    this.name = "PhoneTakenError";
  }
}

export class PhoneInvalidError extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.PHONE_INVALID, statusCode);
    this.name = "PhoneInvalidError";
  }
}

// Login Auth Errors

// If account doesnt exist or password is wrong
export class UsernameOrPasswordError extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.USERNAME_OR_PASSWORD, statusCode);
    this.name = "UsernameOrPasswordError";
  }
}

// Password Reset Errors
export class PasswordReset extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.PASSWORD_RESET, statusCode);
    this.name = "PasswordReset";
  }
}

export class PasswordResetValidate extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.PASSWORD_RESET_VALIDATE, statusCode);
    this.name = "PasswordResetValidate";
  }
}

export class NewPassword extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.NEW_PASSWORD, statusCode);
    this.name = "NewPassword";
  }
}

// Facebook
export class FacebookSignUpError extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.FACEBOOK_SIGNUP, statusCode);
    this.name = "FacebookSignUpError";
  }
}

// Google
export class GoogleSignUpError extends SpotError {
  constructor(statusCode: number) {
    super(AUTHENTICATION_ERROR_MESSAGES.GOOGLE_SIGNUP, statusCode);
    this.name = "GoogleSignUpError";
  }
}
