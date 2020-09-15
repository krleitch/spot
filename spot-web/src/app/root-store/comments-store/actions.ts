import { Action } from '@ngrx/store';

import { AddCommentStoreRequest, SetCommentsStoreRequest,
          DeleteCommentRequest, DeleteCommentSuccess, AddReplyRequest, AddReplySuccess,
          LoadRepliesRequest, LoadRepliesSuccess, DeleteReplyRequest, DeleteReplySuccess,
          LikeCommentRequest, LikeCommentSuccess, DislikeCommentRequest, DislikeCommentSuccess,
          LikeReplyRequest, LikeReplySuccess, DislikeReplyRequest, DislikeReplySuccess } from '@models/comments';
import { SpotError } from '@exceptions/error';

export enum ActionTypes {
  ADD_COMMENT_REQUEST = '[Comments] Add Comment Request',
  ADD_REPLY_REQUEST = '[Comments] Add Reply Request',
  ADD_REPLY_SUCCESS = '[Comments] Add Reply Success',
  ADD_REPLY_FAILURE = '[Comments] Add Reply Failure',
  SET_COMMENTS_REQUEST = '[Comments] Set Request',
  GET_REPLY_REQUEST = '[Comments] Get Reply Request',
  GET_REPLY_SUCCESS = '[Comments] Get Reply Success',
  DELETE_REQUEST = '[Comments] Delete Request',
  DELETE_SUCCESS = '[Comments] Delete Success',
  DELETE_REPLY_REQUEST = '[Comments] Delete Reply Request',
  DELETE_REPLY_SUCCESS = '[Comments] Delete Reply Success',
  LIKE_REQUEST = '[Comments] Like Request',
  LIKE_SUCCESS = '[Comments] Like Success',
  DISLIKE_REQUEST = '[Comments] Dislike Request',
  DISLIKE_SUCCESS = '[Comments] Dislike Success',
  LIKE_REPLY_REQUEST = '[Comments] Like Reply Request',
  LIKE_REPLY_SUCCESS = '[Comments] Like Reply Success',
  DISLIKE_REPLY_REQUEST = '[Comments] Dislike Reply Request',
  DISLIKE_REPLY_SUCCESS = '[Comments] Dislike Reply Success',
  GENERIC_FAILURE = '[Comments] Generic Failure'
}

export class GenericFailureAction implements Action {
  readonly type = ActionTypes.GENERIC_FAILURE;
  constructor(public error: string) {}
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
  constructor(public request: AddReplyRequest) {}
}

export class AddReplySuccessAction implements Action {
  readonly type = ActionTypes.ADD_REPLY_SUCCESS;
  constructor(public response: AddReplySuccess) {}
}

export class AddReplyFailureAction implements Action {
  readonly type = ActionTypes.ADD_REPLY_FAILURE;
  constructor(public error: SpotError, public id: string) {}
}

export class GetReplyRequestAction implements Action {
  readonly type = ActionTypes.GET_REPLY_REQUEST;
  constructor(public request: LoadRepliesRequest) {}
}

export class GetReplySuccessAction implements Action {
  readonly type = ActionTypes.GET_REPLY_SUCCESS;
  constructor(public response: LoadRepliesSuccess) {}
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

export type Actions = AddCommentRequestAction | SetCommentsRequestAction |
                      DeleteRequestAction | DeleteSuccessAction |
                      AddReplyRequestAction | AddReplySuccessAction |
                      GetReplyRequestAction | GetReplySuccessAction |
                      DeleteReplyRequestAction | DeleteReplySuccessAction |
                      LikeRequestAction | LikeSuccessAction |
                      DislikeRequestAction | DislikeSuccessAction |
                      LikeReplyRequestAction | LikeReplySuccessAction |
                      DislikeReplyRequestAction | DislikeReplySuccessAction |
                      GenericFailureAction | AddReplyFailureAction;
