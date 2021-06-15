import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const RATE_LIMIT_ERROR_MESSAGES = ERROR_MESSAGES.RATE_LIMIT;

// limit is # of requests allowed
// timeout is in minutes
export class RateLimitError extends SpotError {
  constructor(statusCode: number, limit: number, timeout: number) {
    super(RATE_LIMIT_ERROR_MESSAGES.RATE_LIMIT, statusCode);
    this.name = "RateLimitError";
    this.body = { limit: limit, timeout: timeout }
  }
}
