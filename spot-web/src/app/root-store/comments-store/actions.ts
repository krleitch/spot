import { Action } from '@ngrx/store';

export enum ActionTypes {
  ADD_REQUEST = '[Comments] Add Request',
  ADD_SUCCESS = '[Comments] Add Success',
  ADD_FAILURE = '[Comments] Add Failure',
  GET_REQUEST = '[Comments] Get Request',
  GET_SUCCESS = '[Comments] Get Success',
  GET_FAILURE = '[Comments] Get Failure',
  DELETE_REQUEST = '[Delete] Delete Request',
  DELETE_SUCCESS = '[Delete] Delete Success',
  DELETE_FAILURE = '[Delete] Delete Failure',
}

export class AddRequestAction implements Action {
    readonly type = ActionTypes.ADD_REQUEST;
    constructor(public request: { postId: string, body: any }) {}
}

export class AddSuccessAction implements Action {
    readonly type = ActionTypes.ADD_SUCCESS;
    constructor(public response: { postId: string, comment: Comment }) {}
}

export class AddFailureAction implements Action {
    readonly type = ActionTypes.ADD_FAILURE;
    constructor(public payload: { error: string }) {}
}

export class GetRequestAction implements Action {
    readonly type = ActionTypes.GET_REQUEST;
    constructor(public request: { postId: string }) {}
}

export class GetSuccessAction implements Action {
    readonly type = ActionTypes.GET_SUCCESS;
    constructor(public response: { postId: string, comments: Comment[] }) {}
}

export class GetFailureAction implements Action {
    readonly type = ActionTypes.GET_FAILURE;
    constructor(public payload: { error: string }) {}
}

export class DeleteRequestAction implements Action {
    readonly type = ActionTypes.DELETE_REQUEST;
    constructor(public request: { commentId: string , postId: string}) {}
}

export class DeleteSuccessAction implements Action {
    readonly type = ActionTypes.DELETE_SUCCESS;
    constructor(public response: any) {}
}

export class DeleteFailureAction implements Action {
    readonly type = ActionTypes.DELETE_FAILURE;
    constructor(public payload: { error: string }) {}
}

export type Actions = AddRequestAction | AddSuccessAction |
                      AddFailureAction | GetRequestAction |
                      GetSuccessAction | GetFailureAction |
                      DeleteRequestAction | DeleteSuccessAction |
                      DeleteFailureAction;
