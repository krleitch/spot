import { SpotError } from "./error";
import { ERROR_MESSAGES } from "./messages";

const RATE_LIMIT_ERROR_MESSAGES = ERROR_MESSAGES.RATE_LIMIT;

// limit is # of requests allowed
// timeout is in minutes
export class RateLimitError extends SpotError {
  constructor(
    statusCode: number = 429,
    limit: number,
    timeout: number, // minutes
    showTimeout: boolean = false
  ) {
    let message = RATE_LIMIT_ERROR_MESSAGES.RATE_LIMIT;
    if (showTimeout) {
      if (timeout === 1) {
        message = RATE_LIMIT_ERROR_MESSAGES.RATE_LMIT_TIMEOUT_SINGLE.replace(
          "%TIMEOUT%",
          timeout.toString()
        );
      } else {
        message = RATE_LIMIT_ERROR_MESSAGES.RATE_LIMIT_TIMEOUT.replace(
          "%TIMEOUT%",
          timeout.toString()
        );
      }
    }

    super(message, statusCode);
    this.name = "RateLimitError";
    this.body = { limit: limit, timeout: timeout };
  }
}
