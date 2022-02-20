import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const REPORT_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.REPORT;

// Generic error
export class ReportError extends SpotError {
    constructor(statusCode: number = 500) {
      super(REPORT_ERROR_MESSAGES.REPORT_ERROR, statusCode);
      this.name = "ReportError";
    }
}

export class ReportLengthError extends SpotError {
    constructor(statusCode: number = 500, minLength: number, maxLength: number) {
      super(REPORT_ERROR_MESSAGES.REPORT_LENGTH, statusCode);
      this.name = "ReportLengthError";
      this.body = { min: minLength, max: maxLength }
    }
}
