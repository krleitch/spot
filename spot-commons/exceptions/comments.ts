import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const COMMENTS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.COMMENTS;

// Create comment

export class AddComment extends SpotError {
    constructor(statusCode) {
      super(COMMENTS_ERROR_MESSAGES.ADD_COMMENT, statusCode);
      this.name = "AddComment";
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

// Other

export class CommentActivity extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.COMMENT_ACTIVITY, statusCode);
    this.name = "CommentActivity";
  }
}

export class GetComments extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.GET_COMMENTS, statusCode);
    this.name = "GetComments";
  }
}

export class GetReplies extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.GET_REPLIES, statusCode);
    this.name = "GetReplies";
  }
}

export class DeleteComment extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.DELETE_COMMENT, statusCode);
    this.name = "DeleteComment";
  }
}

export class DeleteReply extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.DELETE_REPLY, statusCode);
    this.name = "DeleteReply";
  }
}

export class LikeComment extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.LIKE_COMMENT, statusCode);
    this.name = "LikeComment";
  }
}

export class UnratedComment extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.UNRATED_COMMENT, statusCode);
    this.name = "UnratedComment";
  }
}

export class DislikeComment extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.DISLIKE_COMMENT, statusCode);
    this.name = "DislikeComment";
  }
}

export class LikeReply extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.LIKE_REPLY, statusCode);
    this.name = "LikeReply";
  }
}

export class DislikeReply extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.DISLIKE_REPLY, statusCode);
    this.name = "DislikeReply";
  }
}

export class UnratedReply extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.UNRATED_REPLY, statusCode);
    this.name = "UnratedReply";
  }
}

export class ReportComment extends SpotError {
  constructor(statusCode) {
    super(COMMENTS_ERROR_MESSAGES.REPORT_COMMENT, statusCode);
    this.name = "ReportComment";
  }
}
