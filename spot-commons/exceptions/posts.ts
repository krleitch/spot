import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const POSTS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.POSTS;

// Generic error
export class PostError extends SpotError {
    constructor(statusCode: number = 500) {
      super(POSTS_ERROR_MESSAGES.POST_ERROR, statusCode);
      this.name = "PostError";
    }
}

export class InvalidPostContent extends SpotError {
  constructor(statusCode: number = 500) {
    super(POSTS_ERROR_MESSAGES.INVALID_POST_CONTENT, statusCode);
    this.name = "InvalidPostContent";
  }
}

export class InvalidPostLength extends SpotError {
    constructor(statusCode: number = 500, minLength: number, maxLength: number) {
      super(POSTS_ERROR_MESSAGES.INVALID_POST_LENGTH, statusCode);
      this.name = "InvalidPostLength";
      this.body = { min: minLength, max: maxLength }
    }
}

export class InvalidPostProfanity extends SpotError {
  constructor(statusCode: number = 500, profane: string) {
    super(POSTS_ERROR_MESSAGES.INVALID_POST_PROFANITY, statusCode);
    this.name = "InvalidPostProfanity";
    this.body = { word: profane };
  }
}

export class InvalidPostLineLength extends SpotError {
  constructor(statusCode: number = 500, maxLength: number) {
    super(POSTS_ERROR_MESSAGES.INVALID_POST_LINE_LENGTH, statusCode);
    this.name = "InvalidPostLineLength";
    this.body = { max: maxLength }
  }
}

export class NoPostContent extends SpotError {
    constructor(statusCode: number = 500) {
      super(POSTS_ERROR_MESSAGES.NO_CONTENT, statusCode);
      this.name = "NoPostContent";
    }
}

export class PostImage extends SpotError {
  constructor(statusCode: number) {
    super(POSTS_ERROR_MESSAGES.IMAGE, statusCode);
    this.name = "PostImage";
  }
}

export class PostActivity extends SpotError {
  constructor(statusCode: number = 500) {
    super(POSTS_ERROR_MESSAGES.POST_ACTIVITY, statusCode);
    this.name = "PostActivity";
  }
}

export class GetPosts extends SpotError {
  constructor(statusCode: number = 500) {
    super(POSTS_ERROR_MESSAGES.GET_POSTS, statusCode);
    this.name = "GetPosts";
  }
}

export class GetSinglePost extends SpotError {
  constructor(statusCode: number = 500) {
    super(POSTS_ERROR_MESSAGES.GET_SINGLE_POST, statusCode);
    this.name = "GetSinglePost";
  }
}

export class DeletePost extends SpotError {
  constructor(statusCode: number = 500) {
    super(POSTS_ERROR_MESSAGES.DELETE_POST, statusCode);
    this.name = "DeletePost";
  }
}

export class DislikePost extends SpotError {
  constructor(statusCode: number = 500) {
    super(POSTS_ERROR_MESSAGES.DISLIKE_POST, statusCode);
    this.name = "DislikePost";
  }
}

export class LikePost extends SpotError {
  constructor(statusCode: number = 500) {
    super(POSTS_ERROR_MESSAGES.LIKE_POST, statusCode);
    this.name = "LikePost";
  }
}

export class UnratedPost extends SpotError {
  constructor(statusCode: number = 500) {
    super(POSTS_ERROR_MESSAGES.UNRATED_POST, statusCode);
    this.name = "UnratedPost";
  }
}