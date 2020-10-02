import { Action } from '@ngrx/store';

import { AddPostRequest, AddPostSuccess, LikePostRequest, DislikePostRequest, LikePostSuccess, DislikePostSuccess,
          DeletePostRequest, DeletePostSuccess, LoadPostSuccess, LoadPostRequest, UnratedPostRequest,
          UnratedPostSuccess } from '@models/posts';
import { SpotError } from '@exceptions/error';

export enum ActionTypes {
  LIKE_REQUEST = '[Posts] Like Request',
  LIKE_SUCCESS = '[Posts] Like Success',
  DISLIKE_REQUEST = '[Posts] Dislike Request',
  DISLIKE_SUCCESS = '[Posts] Dislike Success',
  UNRATED_REQUEST = '[Posts] Unrated Request',
  UNRATED_SUCCESS = '[Posts] Unrated Success',
  DELETE_REQUEST = '[Posts] Delete Request',
  DELETE_SUCCESS = '[Posts] Delete Success',
  ADD_REQUEST = '[Posts] Add Request',
  ADD_SUCCESS = '[Posts] Add Success',
  ADD_FAILURE = '[Posts] Add Failure',
  LOAD_REQUEST = '[Posts] Load Request',
  LOAD_SUCCESS = '[Posts] Load Success',
  GENERIC_FAILURE = '[Posts] Generic Failure'
}

export class GenericFailureAction implements Action {
  readonly type = ActionTypes.GENERIC_FAILURE;
  constructor(public error: SpotError) {}
}

export class LikeRequestAction implements Action {
  readonly type = ActionTypes.LIKE_REQUEST;
  constructor(public request: LikePostRequest) {}
}

export class LikeSuccessAction implements Action {
  readonly type = ActionTypes.LIKE_SUCCESS;
  constructor(public response: LikePostSuccess) {}
}

export class DislikeRequestAction implements Action {
  readonly type = ActionTypes.DISLIKE_REQUEST;
  constructor(public request: DislikePostRequest) {}
}

export class DislikeSuccessAction implements Action {
  readonly type = ActionTypes.DISLIKE_SUCCESS;
  constructor(public response: DislikePostSuccess) {}
}

export class UnratedRequestAction implements Action {
  readonly type = ActionTypes.UNRATED_REQUEST;
  constructor(public request: UnratedPostRequest) {}
}

export class UnratedSuccessAction implements Action {
  readonly type = ActionTypes.UNRATED_SUCCESS;
  constructor(public response: UnratedPostSuccess) {}
}

export class DeleteRequestAction implements Action {
  readonly type = ActionTypes.DELETE_REQUEST;
  constructor(public request: DeletePostRequest) {}
}

export class DeleteSuccessAction implements Action {
  readonly type = ActionTypes.DELETE_SUCCESS;
  constructor(public response: DeletePostSuccess) {}
}

export class AddRequestAction implements Action {
  readonly type = ActionTypes.ADD_REQUEST;
  constructor(public request: AddPostRequest) {}
}

export class AddSuccessAction implements Action {
  readonly type = ActionTypes.ADD_SUCCESS;
  constructor(public response: AddPostSuccess) {}
}

export class AddFailureAction implements Action {
  readonly type = ActionTypes.ADD_FAILURE;
  constructor(public error: SpotError) {}
}

export class LoadRequestAction implements Action {
  readonly type = ActionTypes.LOAD_REQUEST;
  constructor(public request: LoadPostRequest ) {}
}

export class LoadSuccessAction implements Action {
  readonly type = ActionTypes.LOAD_SUCCESS;
  constructor(public response: LoadPostSuccess) {}
}

export type Actions = GenericFailureAction | LoadRequestAction | LoadSuccessAction |
                      AddRequestAction | AddSuccessAction | AddFailureAction |
                      DeleteRequestAction | DeleteSuccessAction | LikeRequestAction |
                      LikeSuccessAction | DislikeRequestAction | DislikeSuccessAction |
                      UnratedRequestAction | UnratedSuccessAction;
