import { SpotError } from './error';

// If username doesnt exist or is yourself, or already added / requested
export class UsernameError extends SpotError {
    constructor(message, statusCode) {
      super(message);
      this.name = "UsernameError";
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    }
}
