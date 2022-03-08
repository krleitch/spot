import { Action } from '@ngrx/store';

import {
  AddCommentStoreRequest,
  AddReplyStoreRequest,
  ClearCommentsRequest,
  DeleteCommentRequest,
  DeleteCommentResponse,
  DeleteReplyRequest,
  DeleteReplyResponse,
  RateCommentRequest,
  RateCommentResponse,
  RateReplyRequest,
  RateReplyResponse,
  SetCommentsStoreRequest,
  SetRepliesStoreRequest,
  CommentRatingType
} from '@models/comment';
import { SpotError } from '@exceptions/error';

export enum ActionTypes {
  RESET_STORE = '[Comment] Reset Store',
  CLEAR_COMMENTS_REQUEST = '[Comment] Clear Comments Request',
  ADD_COMMENT_REQUEST = '[Comment] Add Comment Request',
  ADD_REPLY_REQUEST = '[Comment] Add Reply Request',
  SET_COMMENTS_REQUEST = '[Comment] Set Comments Request',
  SET_REPLIES_REQUEST = '[Comment] Set Replies Request',
  DELETE_REQUEST = '[Comment] Delete Request',
  DELETE_SUCCESS = '[Comment] Delete Success',
  DELETE_REPLY_REQUEST = '[Comment] Delete Reply Request',
  DELETE_REPLY_SUCCESS = '[Comment] Delete Reply Success',
  RATE_REQUEST = '[Comment] Rate Request',
  RATE_SUCCESS = '[Comment] Rate Success',
  RATE_REPLY_REQUEST = '[Comment] Rate Reply Request',
  RATE_REPLY_SUCCESS = '[Comment] Rate Reply Success',
  GENERIC_FAILURE = '[Comment] Generic Failure'
}

export class ResetStoreAction implements Action {
  readonly type = ActionTypes.RESET_STORE;
  constructor() {}
}

export class ClearCommentsRequestAction implements Action {
  readonly type = ActionTypes.CLEAR_COMMENTS_REQUEST;
  constructor(public request: ClearCommentsRequest) {}
}

export class GenericFailureAction implements Action {
  readonly type = ActionTypes.GENERIC_FAILURE;
  constructor(public error: SpotError) {}
}

export class AddCommentRequestAction implements Action {
  readonly type = ActionTypes.ADD_COMMENT_REQUEST;
  constructor(public request: AddCommentStoreRequest) {}
}

export class SetCommentsRequestAction implements Action {
  readonly type = ActionTypes.SET_COMMENTS_REQUEST;
  constructor(public request: SetCommentsStoreRequest) {}
}

export class DeleteRequestAction implements Action {
  readonly type = ActionTypes.DELETE_REQUEST;
  constructor(public request: DeleteCommentRequest) {}
}

export class DeleteSuccessAction implements Action {
  readonly type = ActionTypes.DELETE_SUCCESS;
  constructor(
    public response: {
      response: DeleteCommentResponse;
      spotId: string;
      commentId: string;
    }
  ) {}
}

export class AddReplyRequestAction implements Action {
  readonly type = ActionTypes.ADD_REPLY_REQUEST;
  constructor(public request: AddReplyStoreRequest) {}
}

export class SetRepliesRequestAction implements Action {
  readonly type = ActionTypes.SET_REPLIES_REQUEST;
  constructor(public request: SetRepliesStoreRequest) {}
}

export class DeleteReplyRequestAction implements Action {
  readonly type = ActionTypes.DELETE_REPLY_REQUEST;
  constructor(public request: DeleteReplyRequest) {}
}

export class DeleteReplySuccessAction implements Action {
  readonly type = ActionTypes.DELETE_REPLY_SUCCESS;
  constructor(
    public response: {
      response: DeleteReplyResponse;
      spotId: string;
      commentId: string;
      replyId: string;
    }
  ) {}
}

export class RateRequestAction implements Action {
  readonly type = ActionTypes.RATE_REQUEST;
  constructor(public request: RateCommentRequest) {}
}

export class RateSuccessAction implements Action {
  readonly type = ActionTypes.RATE_SUCCESS;
  constructor(
    public response: {
      response: RateCommentResponse;
      spotId: string;
      commentId: string;
      rating: CommentRatingType;
    }
  ) {}
}

export class RateReplyRequestAction implements Action {
  readonly type = ActionTypes.RATE_REPLY_REQUEST;
  constructor(public request: RateReplyRequest) {}
}

export class RateReplySuccessAction implements Action {
  readonly type = ActionTypes.RATE_REPLY_SUCCESS;
  constructor(
    public response: {
      response: RateReplyResponse;
      spotId: string;
      commentId: string;
      replyId: string;
      rating: CommentRatingType;
    }
  ) {}
}

export type Actions =
  | AddCommentRequestAction
  | ClearCommentsRequestAction
  | SetCommentsRequestAction
  | DeleteRequestAction
  | DeleteSuccessAction
  | RateSuccessAction
  | SetRepliesRequestAction
  | AddReplyRequestAction
  | DeleteReplyRequestAction
  | DeleteReplySuccessAction
  | RateReplySuccessAction
  | GenericFailureAction
  | ResetStoreAction;
