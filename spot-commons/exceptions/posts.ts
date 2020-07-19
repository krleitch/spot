import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const POSTS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.POSTS;

// Generic error
export class PostError extends SpotError {
    constructor(statusCode) {
      super(POSTS_ERROR_MESSAGES.POST_ERROR, statusCode);
      this.name = "PostError";
    }
}

export class InvalidPostContent extends SpotError {
  constructor(statusCode) {
    super(POSTS_ERROR_MESSAGES.INVALID_POST_CONTENT, statusCode);
    this.name = "InvalidPostContent";
  }
}

export class InvalidPostLength extends SpotError {
    constructor(statusCode, minLength, maxLength) {
      super(POSTS_ERROR_MESSAGES.INVALID_POST_LENGTH, statusCode);
      this.name = "InvalidPostLength";
      this.body = { min: minLength, max: maxLength }
    }
}

export class InvalidPostProfanity extends SpotError {
  constructor(statusCode) {
    super(POSTS_ERROR_MESSAGES.INVALID_POST_PROFANITY, statusCode);
    this.name = "InvalidPostProfanity";
  }
}

export class InvalidPostLineLength extends SpotError {
  constructor(statusCode, maxLength) {
    super(POSTS_ERROR_MESSAGES.INVALID_POST_LINE_LENGTH, statusCode);
    this.name = "InvalidPostLineLength";
    this.body = { max: maxLength }
  }
}

export class NoPostContent extends SpotError {
    constructor(statusCode) {
      super(POSTS_ERROR_MESSAGES.NO_CONTENT, statusCode);
      this.name = "NoPostContent";
    }
}

export class AccountNotVerified extends SpotError {
  constructor(statusCode) {
    super(POSTS_ERROR_MESSAGES.VERIFY, statusCode);
    this.name = "AccountNotVerified";
  }
}

export class PostImage extends SpotError {
  constructor(statusCode) {
    super(POSTS_ERROR_MESSAGES.IMAGE, statusCode);
    this.name = "PostImage";
  }
}
