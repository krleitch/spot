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

export class InvalidCommentContent extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.INVALID_COMMENT_CONTENT, statusCode);
    this.name = "InvalidCommentContent";
  }
}

export class InvalidCommentLength extends SpotError {
    constructor(statusCode, minLength, maxLength) {
      super(COMMENTS_ERROR_MESSAGES.INVALID_COMMENT_LENGTH, statusCode);
      this.name = "InvalidCommentLength";
      this.body = { min: minLength, max: maxLength }
    }
}

export class InvalidCommentProfanity extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.INVALID_COMMENT_PROFANITY, statusCode);
    this.name = "InvalidCommentProfanity";
  }
}

export class CommentImage extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.IMAGE, statusCode);
    this.name = "CommentImage";
  }
}

export class InvalidCommentLineLength extends SpotError {
  constructor(statusCode, maxLength) {
    super(COMMENTS_ERROR_MESSAGES.INVALID_COMMENT_LINE_LENGTH, statusCode);
    this.name = "InvalidCommentLineLength";
    this.body = { max: maxLength }
  }
}

export class NoCommentContent extends SpotError {
    constructor(statusCode) {
      super(COMMENTS_ERROR_MESSAGES.NO_CONTENT, statusCode);
      this.name = "NoCommentContent";
    }
}
