
import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const AUTHORIZATION_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.AUTHORIZATION;

// The user is not authorized
export class AuthorizationError extends SpotError {
  constructor(statusCode: number = 400) {
    super(AUTHORIZATION_ERROR_MESSAGES.NOT_AUTHORIZED, statusCode);
    this.name = "AuthorizationError";
  }
}