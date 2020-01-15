import { Action } from '@ngrx/store';

import { AddPostRequest } from '@models/posts';

export enum ActionTypes {
  LIKE_REQUEST = '[Posts] Like Request',
  DISLIKE_REQUEST = '[Posts] Dislike Request',
  DELETE_REQUEST = '[Posts] Delete Request',
  DELETE_FAILURE = '[Posts] Delete Request',
  DELETE_SUCCESS = '[Posts] Delete Request',
  ADD_REQUEST = '[Posts] Add Request',
  ADD_FAILURE = '[Posts] Add Failure',
  ADD_SUCCESS = '[Posts] Add Success',
  LOAD_REQUEST = '[Posts] Load Request',
  LOAD_FAILURE = '[Posts] Load Failure',
  LOAD_SUCCESS = '[Posts] Load Success'
}

export class LikeRequestAction implements Action {
  readonly type = ActionTypes.LIKE_REQUEST;
  constructor(public request: any) {}
}

export class DislikeRequestAction implements Action {
  readonly type = ActionTypes.DISLIKE_REQUEST;
  constructor(public request: any) {}
}

export class DeleteRequestAction implements Action {
  readonly type = ActionTypes.DELETE_REQUEST;
  constructor(public request: any) {}
}

export class DeleteFailureAction implements Action {
  readonly type = ActionTypes.DELETE_FAILURE;
  constructor(public payload: { error: string }) {}
}

export class DeleteSuccessAction implements Action {
  readonly type = ActionTypes.DELETE_SUCCESS;
}

export class AddRequestAction implements Action {
  readonly type = ActionTypes.ADD_REQUEST;
  constructor(public request: AddPostRequest) {}
}

export class AddFailureAction implements Action {
  readonly type = ActionTypes.ADD_FAILURE;
  constructor(public error: string) {}
}

export class AddSuccessAction implements Action {
  readonly type = ActionTypes.ADD_SUCCESS;
}

export class LoadRequestAction implements Action {
  readonly type = ActionTypes.LOAD_REQUEST;
}

export class LoadFailureAction implements Action {
  readonly type = ActionTypes.LOAD_FAILURE;
  constructor(public error: string) {}
}

export class LoadSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_SUCCESS;
  constructor(public payload: { items: any[] }) {}
}

export type Actions = LoadRequestAction | LoadFailureAction | LoadSuccessAction |
                      AddRequestAction | AddFailureAction | AddSuccessAction |
                      DeleteRequestAction | DeleteFailureAction | DeleteSuccessAction |
                      LikeRequestAction | DislikeRequestAction;
