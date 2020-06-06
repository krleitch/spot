import { SpotError } from './error';

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
  constructor(message, statusCode, minLength, maxLength) {
    super(message, statusCode);
    this.name = "UsernameCharacterError";
  }
}


export class UsernameTakenError extends SpotError {
  constructor(message, statusCode, minLength, maxLength) {
    super(message, statusCode);
    this.name = "UsernameTakenError";
  }
}

// Password
export class PasswordInvalidError extends SpotError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = "PasswordInvalidError";
  }
}

// Email
export class EmailInvalidError extends SpotError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.name = "EmailInvalidError";
  }
}

// Phone
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
