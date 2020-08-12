import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const RATE_LIMIT_ERROR_MESSAGES = ERROR_MESSAGES.RATE_LIMIT;

export class RateLimitError extends SpotError {
  constructor(statusCode, limit, timeout) {
    super(RATE_LIMIT_ERROR_MESSAGES.RATE_LIMIT, statusCode);
    this.name = "RateLimitError";
    this.body = { limit: limit, timeout: timeout }
  }
}
