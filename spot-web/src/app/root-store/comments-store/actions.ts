import { Action } from '@ngrx/store';

import {
  AddCommentStoreRequest,
  AddReplyStoreRequest,
  ClearCommentsRequest,
  DeleteCommentRequest,
  DeleteCommentSuccess,
  DeleteReplyRequest,
  DeleteReplySuccess,
  DislikeCommentRequest,
  DislikeCommentSuccess,
  DislikeReplyRequest,
  DislikeReplySuccess,
  LikeCommentRequest,
  LikeCommentSuccess,
  LikeReplyRequest,
  LikeReplySuccess,
  SetCommentsStoreRequest,
  SetRepliesStoreRequest,
  UnratedCommentRequest,
  UnratedCommentSuccess,
  UnratedReplyRequest,
  UnratedReplySuccess
} from '@models/comments';
import { SpotError } from '@exceptions/error';

export enum ActionTypes {
  RESET_STORE = '[Comments] Reset Store',
  CLEAR_COMMENTS_REQUEST = '[Comments] Clear Comments Request',
  ADD_COMMENT_REQUEST = '[Comments] Add Comment Request',
  ADD_REPLY_REQUEST = '[Comments] Add Reply Request',
  SET_COMMENTS_REQUEST = '[Comments] Set Comments Request',
  SET_REPLIES_REQUEST = '[Comments] Set Replies Request',
  DELETE_REQUEST = '[Comments] Delete Request',
  DELETE_SUCCESS = '[Comments] Delete Success',
  DELETE_REPLY_REQUEST = '[Comments] Delete Reply Request',
  DELETE_REPLY_SUCCESS = '[Comments] Delete Reply Success',
  LIKE_REQUEST = '[Comments] Like Request',
  LIKE_SUCCESS = '[Comments] Like Success',
  DISLIKE_REQUEST = '[Comments] Dislike Request',
  DISLIKE_SUCCESS = '[Comments] Dislike Success',
  UNRATED_REQUEST = '[Comments] Unrated Request',
  UNRATED_SUCCESS = '[Comments] Unrated Success',
  LIKE_REPLY_REQUEST = '[Comments] Like Reply Request',
  LIKE_REPLY_SUCCESS = '[Comments] Like Reply Success',
  DISLIKE_REPLY_REQUEST = '[Comments] Dislike Reply Request',
  DISLIKE_REPLY_SUCCESS = '[Comments] Dislike Reply Success',
  UNRATED_REPLY_REQUEST = '[Comments] Unrated Reply Request',
  UNRATED_REPLY_SUCCESS = '[Comments] Unrated Reply Success',
  GENERIC_FAILURE = '[Comments] Generic Failure'
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
  constructor(public response: DeleteCommentSuccess) {}
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
  constructor(public response: DeleteReplySuccess) {}
}

export class LikeRequestAction implements Action {
  readonly type = ActionTypes.LIKE_REQUEST;
  constructor(public request: LikeCommentRequest) {}
}

export class LikeSuccessAction implements Action {
  readonly type = ActionTypes.LIKE_SUCCESS;
  constructor(public response: LikeCommentSuccess) {}
}

export class DislikeRequestAction implements Action {
  readonly type = ActionTypes.DISLIKE_REQUEST;
  constructor(public request: DislikeCommentRequest) {}
}

export class DislikeSuccessAction implements Action {
  readonly type = ActionTypes.DISLIKE_SUCCESS;
  constructor(public response: DislikeCommentSuccess) {}
}

export class UnratedRequestAction implements Action {
  readonly type = ActionTypes.UNRATED_REQUEST;
  constructor(public request: UnratedCommentRequest) {}
}

export class UnratedSuccessAction implements Action {
  readonly type = ActionTypes.UNRATED_SUCCESS;
  constructor(public response: UnratedCommentSuccess) {}
}

export class LikeReplyRequestAction implements Action {
  readonly type = ActionTypes.LIKE_REPLY_REQUEST;
  constructor(public request: LikeReplyRequest) {}
}

export class LikeReplySuccessAction implements Action {
  readonly type = ActionTypes.LIKE_REPLY_SUCCESS;
  constructor(public response: LikeReplySuccess) {}
}

export class DislikeReplyRequestAction implements Action {
  readonly type = ActionTypes.DISLIKE_REPLY_REQUEST;
  constructor(public request: DislikeReplyRequest) {}
}

export class DislikeReplySuccessAction implements Action {
  readonly type = ActionTypes.DISLIKE_REPLY_SUCCESS;
  constructor(public response: DislikeReplySuccess) {}
}

export class UnratedReplyRequestAction implements Action {
  readonly type = ActionTypes.UNRATED_REPLY_REQUEST;
  constructor(public request: UnratedReplyRequest) {}
}

export class UnratedReplySuccessAction implements Action {
  readonly type = ActionTypes.UNRATED_REPLY_SUCCESS;
  constructor(public response: UnratedReplySuccess) {}
}

export type Actions =
  | AddCommentRequestAction
  | ClearCommentsRequestAction
  | SetCommentsRequestAction
  | DeleteRequestAction
  | DeleteSuccessAction
  | SetRepliesRequestAction
  | AddReplyRequestAction
  | DeleteReplyRequestAction
  | DeleteReplySuccessAction
  | LikeRequestAction
  | LikeSuccessAction
  | DislikeRequestAction
  | DislikeSuccessAction
  | LikeReplyRequestAction
  | LikeReplySuccessAction
  | DislikeReplyRequestAction
  | DislikeReplySuccessAction
  | GenericFailureAction
  | UnratedRequestAction
  | UnratedSuccessAction
  | UnratedReplyRequestAction
  | UnratedReplySuccessAction
  | ResetStoreAction;
