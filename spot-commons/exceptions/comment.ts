import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const COMMENTS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.COMMENTS;

// Create comment

export class AddComment extends SpotError {
    constructor(statusCode: number = 500) {
      super(COMMENTS_ERROR_MESSAGES.ADD_COMMENT, statusCode);
      this.name = "AddComment";
    }
}

export class InvalidCommentContent extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.INVALID_COMMENT_CONTENT, statusCode);
    this.name = "InvalidCommentContent";
  }
}

export class InvalidCommentLength extends SpotError {
    constructor(statusCode: number = 500, minLength: number, maxLength: number) {
      super(COMMENTS_ERROR_MESSAGES.INVALID_COMMENT_LENGTH, statusCode);
      this.name = "InvalidCommentLength";
      this.body = { min: minLength, max: maxLength }
    }
}

export class InvalidCommentProfanity extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.INVALID_COMMENT_PROFANITY, statusCode);
    this.name = "InvalidCommentProfanity";
  }
}

export class CommentImage extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.IMAGE, statusCode);
    this.name = "CommentImage";
  }
}

export class InvalidCommentLineLength extends SpotError {
  constructor(statusCode: number = 500, maxLength: number) {
    super(COMMENTS_ERROR_MESSAGES.INVALID_COMMENT_LINE_LENGTH, statusCode);
    this.name = "InvalidCommentLineLength";
    this.body = { max: maxLength }
  }
}

export class NoCommentContent extends SpotError {
    constructor(statusCode: number = 500) {
      super(COMMENTS_ERROR_MESSAGES.NO_CONTENT, statusCode);
      this.name = "NoCommentContent";
    }
}

// Other

export class CommentActivity extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.COMMENT_ACTIVITY, statusCode);
    this.name = "CommentActivity";
  }
}

export class GetComments extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.GET_COMMENTS, statusCode);
    this.name = "GetComments";
  }
}

export class GetReplies extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.GET_REPLIES, statusCode);
    this.name = "GetReplies";
  }
}

export class DeleteComment extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.DELETE_COMMENT, statusCode);
    this.name = "DeleteComment";
  }
}

export class DeleteReply extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.DELETE_REPLY, statusCode);
    this.name = "DeleteReply";
  }
}

export class RateComment extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.RATE_COMMENT, statusCode);
    this.name = "RateComment";
  }
}

export class RateReply extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.RATE_REPLY, statusCode);
    this.name = "RateReply";
  }
}

export class ReportComment extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.REPORT_COMMENT, statusCode);
    this.name = "ReportComment";
  }
}

export class NotTagged extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.NOT_TAGGED, statusCode);
    this.name = "NotTagged";
  }
}

export class NotInRange extends SpotError {
  constructor(statusCode: number = 500) {
    super(COMMENTS_ERROR_MESSAGES.NOT_IN_RANGE, statusCode);
    this.name = "NotInRange";
  }
}


