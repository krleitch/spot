import { SpotError } from './error';

// If username doesnt exist or is yourself, or already added / requested
export class UsernameError extends SpotError {
    constructor(message, statusCode) {
      super(message, statusCode);
      this.name = "UsernameError";
    }
}
