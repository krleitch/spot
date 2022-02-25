import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const LOCATION_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.LOCATION;

// Invalid Location
export class LocationError extends SpotError {
    constructor(statusCode: number = 500) {
      super(LOCATION_ERROR_MESSAGES.LOCATION_ERROR, statusCode);
      this.name = "LocationError";
    }
}
