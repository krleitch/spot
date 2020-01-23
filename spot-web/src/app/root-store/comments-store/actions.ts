import { Action } from '@ngrx/store';

import { LoadCommentsRequest, LoadCommentsSuccess, AddCommentRequest, AddCommentSuccess } from '@models/comments';

export enum ActionTypes {
  ADD_REQUEST = '[Comments] Add Request',
  ADD_SUCCESS = '[Comments] Add Success',
  GET_REQUEST = '[Comments] Get Request',
  GET_SUCCESS = '[Comments] Get Success',
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
    constructor(public request: { commentId: string , postId: string}) {}
}

export class DeleteSuccessAction implements Action {
    readonly type = ActionTypes.DELETE_SUCCESS;
    constructor(public response: any) {}
}

export type Actions = AddRequestAction | AddSuccessAction |
                      GetRequestAction | GetSuccessAction |
                      DeleteRequestAction | DeleteSuccessAction |
                      GenericFailureAction;
