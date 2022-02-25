import { Action } from '@ngrx/store';

import {
  CreateSpotRequest,
  CreateSpotResponse,
  DeleteSpotRequest,
  DeleteSpotResponse,
  RateSpotRequest,
  RateSpotResponse,
  GetSpotRequest,
  GetSpotResponse,
  DeleteRatingRequest,
  DeleteRatingResponse,
  SpotRatingType
} from '@models/../newModels/spot';
import { SpotError } from '@exceptions/error';

export enum ActionTypes {
  RESET_STORE = '[Spot] Reset Store',
  RATE_REQUEST = '[Spot] Rate Request',
  RATE_SUCCESS = '[Spot] Rate Success',
  DELETE_RATING_REQUEST = '[Spot] Delete rating Request',
  DELETE_RATING_SUCCESS = '[Spot] Delete rating Success',
  DELETE_REQUEST = '[Spot] Delete Request',
  DELETE_SUCCESS = '[Spot] Delete Success',
  CREATE_REQUEST = '[Spot] Create Request',
  CREATE_SUCCESS = '[Spot] Create Success',
  CREATE_FAILURE = '[Spot] Create Failure',
  GET_REQUEST = '[Spot] Get Request',
  GET_SUCCESS = '[Spot] Get Success',
  CREATE_COMMENT = '[Spot] Create Comment',
  DELETE_COMMENT = '[Spot] Delete Comment',
  GENERIC_FAILURE = '[Spot] Generic Failure'
}

export class ResetStoreAction implements Action {
  readonly type = ActionTypes.RESET_STORE;
  constructor() {}
}

export class GenericFailureAction implements Action {
  readonly type = ActionTypes.GENERIC_FAILURE;
  constructor(public error: SpotError) {}
}

export class RateRequestAction implements Action {
  readonly type = ActionTypes.RATE_REQUEST;
  constructor(public request: RateSpotRequest) {}
}

export class RateSuccessAction implements Action {
  readonly type = ActionTypes.RATE_SUCCESS;
  constructor(
    public response: {
      response: RateSpotResponse;
      spotId: string;
      rating: SpotRatingType;
    }
  ) {}
}

export class DeleteRatingRequestAction implements Action {
  readonly type = ActionTypes.DELETE_RATING_REQUEST;
  constructor(public request: DeleteRatingRequest) {}
}

export class DeleteRatingSuccessAction implements Action {
  readonly type = ActionTypes.DELETE_RATING_SUCCESS;
  constructor(
    public response: { response: DeleteRatingResponse; spotId: string }
  ) {}
}

export class DeleteRequestAction implements Action {
  readonly type = ActionTypes.DELETE_REQUEST;
  constructor(public request: DeleteSpotRequest) {}
}

export class DeleteSuccessAction implements Action {
  readonly type = ActionTypes.DELETE_SUCCESS;
  constructor(
    public response: { response: DeleteSpotResponse; spotId: string }
  ) {}
}

export class CreateRequestAction implements Action {
  readonly type = ActionTypes.CREATE_REQUEST;
  constructor(public request: CreateSpotRequest) {}
}

export class CreateSuccessAction implements Action {
  readonly type = ActionTypes.CREATE_SUCCESS;
  constructor(public response: CreateSpotResponse) {}
}

export class CreateFailureAction implements Action {
  readonly type = ActionTypes.CREATE_FAILURE;
  constructor(public error: SpotError) {}
}

export class GetRequestAction implements Action {
  readonly type = ActionTypes.GET_REQUEST;
  constructor(public request: GetSpotRequest) {}
}

export class GetSuccessAction implements Action {
  readonly type = ActionTypes.GET_SUCCESS;
  constructor(public response: GetSpotResponse) {}
}

export class CreateCommentAction implements Action {
  readonly type = ActionTypes.CREATE_COMMENT;
  constructor(public request: { spotId: string }) {}
}

export class DeleteCommentAction implements Action {
  readonly type = ActionTypes.DELETE_COMMENT;
  constructor(public request: { spotId: string }) {}
}

export type Actions =
  | GenericFailureAction
  | GetRequestAction
  | GetSuccessAction
  | CreateRequestAction
  | CreateSuccessAction
  | CreateFailureAction
  | DeleteRequestAction
  | DeleteSuccessAction
  | RateRequestAction
  | RateSuccessAction
  | DeleteRatingRequestAction
  | DeleteRatingSuccessAction
  | CreateCommentAction
  | DeleteCommentAction
  | ResetStoreAction;
