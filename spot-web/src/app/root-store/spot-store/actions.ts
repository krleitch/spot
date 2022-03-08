import { Action } from '@ngrx/store';

import {
  AddSpotStoreRequest,
  DeleteSpotRequest,
  DeleteSpotResponse,
  RateSpotRequest,
  RateSpotResponse,
  SetSpotStoreRequest,
  DeleteRatingRequest,
  DeleteRatingResponse,
  SpotRatingType
} from '@models/spot';
import { SpotError } from '@exceptions/error';

export enum ActionTypes {
  RESET_STORE = '[Spot] Reset Store',
  RATE_REQUEST = '[Spot] Rate Request',
  RATE_SUCCESS = '[Spot] Rate Success',
  DELETE_RATING_REQUEST = '[Spot] Delete rating Request',
  DELETE_RATING_SUCCESS = '[Spot] Delete rating Success',
  DELETE_REQUEST = '[Spot] Delete Request',
  DELETE_SUCCESS = '[Spot] Delete Success',
  ADD_SPOT_STORE_REQUEST = '[Spot] Add Spot store request',
  CREATE_FAILURE = '[Spot] Create Failure',
  SET_SPOT_STORE_REQUEST = '[Spot] Set Spot Store Request',
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

export class AddSpotStoreAction implements Action {
  readonly type = ActionTypes.ADD_SPOT_STORE_REQUEST;
  constructor(public request: AddSpotStoreRequest) {}
}
export class CreateFailureAction implements Action {
  readonly type = ActionTypes.CREATE_FAILURE;
  constructor(public error: SpotError) {}
}

export class SetSpotStoreRequestAction implements Action {
  readonly type = ActionTypes.SET_SPOT_STORE_REQUEST;
  constructor(public request: SetSpotStoreRequest) {}
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
  | SetSpotStoreRequestAction
  | AddSpotStoreAction
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
