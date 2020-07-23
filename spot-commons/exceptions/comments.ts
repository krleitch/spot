import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const COMMENTS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.COMMENTS;

// Generic error
export class CommentError extends SpotError {
    constructor(statusCode) {
      super(COMMENTS_ERROR_MESSAGES.COMMENT_ERROR, statusCode);
      this.name = "CommentError";
    }
}

