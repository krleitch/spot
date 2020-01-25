import { Action } from '@ngrx/store';

import { LoadCommentsRequest, LoadCommentsSuccess, AddCommentRequest, AddCommentSuccess,
          DeleteCommentRequest, DeleteCommentSuccess, AddReplyRequest, AddReplySuccess,
          LoadRepliesRequest, LoadRepliesSuccess } from '@models/comments';

export enum ActionTypes {
  ADD_REQUEST = '[Comments] Add Request',
  ADD_SUCCESS = '[Comments] Add Success',
  ADD_REPLY_REQUEST = '[Comments] Add Reply Request',
  ADD_REPLY_SUCCESS = '[Comments] Add Reply Success',
  GET_REQUEST = '[Comments] Get Request',
  GET_SUCCESS = '[Comments] Get Success',
  GET_REPLY_REQUEST = '[Comments] Get Reply Request',
  GET_REPLY_SUCCESS = '[Comments] Get Reply Success',
  DELETE_REQUEST = '[Comments] Delete Request',
  DELETE_SUCCESS = '[Comments] Delete Success',
  GENERIC_FAILURE = '[Comments] Generic Failure'
}

export class GenericFailureAction implements Action {
  readonly type = ActionTypes.GENERIC_FAILURE;
  constructor(public error: string) {}
}

export class AddRequestAction implements Action {
    readonly type = ActionTypes.ADD_REQUEST;
    constructor(public request: AddCommentRequest) {}
}

export class AddSuccessAction implements Action {
    readonly type = ActionTypes.ADD_SUCCESS;
    constructor(public response: AddCommentSuccess) {}
}

export class GetRequestAction implements Action {
    readonly type = ActionTypes.GET_REQUEST;
    constructor(public request: LoadCommentsRequest) {}
}

export class GetSuccessAction implements Action {
    readonly type = ActionTypes.GET_SUCCESS;
    constructor(public response: LoadCommentsSuccess) {}
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

export class GetReplyRequestAction implements Action {
  readonly type = ActionTypes.GET_REPLY_REQUEST;
  constructor(public request: LoadRepliesRequest) {}
}

export class GetReplySuccessAction implements Action {
  readonly type = ActionTypes.GET_REPLY_SUCCESS;
  constructor(public response: LoadRepliesSuccess) {}
}

export type Actions = AddRequestAction | AddSuccessAction |
                      GetRequestAction | GetSuccessAction |
                      DeleteRequestAction | DeleteSuccessAction |
                      AddReplyRequestAction | AddReplySuccessAction |
                      GetReplyRequestAction | GetReplySuccessAction |
                      GenericFailureAction;
