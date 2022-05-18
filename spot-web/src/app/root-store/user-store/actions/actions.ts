import { Action } from '@ngrx/store';

// Models
import {
  GetUserRequest,
  GetUserResponse,
  SetUserStore,
  DeleteUserStore
} from '@models/user';
import {
  GetUserMetadataRequest,
  GetUserMetadataResponse,
  UpdateUserMetadataRequest,
  UpdateUserMetadataResponse
} from '@models/userMetadata';
import {
  SetLoadingLocation,
  SetLocationFailure,
  SetLocation
} from '@models/location';
import { SpotError } from '@exceptions/error';

export enum ActionTypes {
  RESET_STORE = '[User] Reset Store',
  // USER
  GET_USER_REQUEST = '[User] Get User Request',
  GET_USER_SUCCESS = '[User] Get User Success',
  GET_USER_FAILURE = '[User] Get User Failure',
  SET_USER = '[User] Set User',
  LOGOUT_USER = '[User] Logout User',
  DELETE_USER = '[User] Delete User',
  // METADATA
  GET_METADATA_REQUEST = '[User] Get Metadata Request',
  GET_METADATA_SUCCESS = '[User] Get Metadata Success',
  GET_METADATA_FAILURE = '[User] Get Metadata Failure',
  UPDATE_METADATA_REQUEST = '[User] Update Metadata Request',
  UPDATE_METADATA_SUCCESS = '[User] Update Metadata Success',
  UPDATE_METADATA_FAILURE = '[User] Update Metadata Failure',
  // LOCATION
  SET_LOADING_LOCATION = '[User] Set Loading Location',
  SET_LOCATION = '[User] Set Location',
  SET_LOCATION_FAILURE = '[User] Set Location Failure'
}

export class ResetStoreAction implements Action {
  readonly type = ActionTypes.RESET_STORE;
  constructor() {}
}

// User
export class GetUserRequestAction implements Action {
  readonly type = ActionTypes.GET_USER_REQUEST;
  constructor(public request: GetUserRequest) {}
}
export class GetUserSuccessAction implements Action {
  readonly type = ActionTypes.GET_USER_SUCCESS;
  constructor(public response: GetUserResponse) {}
}
export class GetUserFailureAction implements Action {
  readonly type = ActionTypes.GET_USER_FAILURE;
  constructor(public error: SpotError) {}
}
export class LogoutUserAction implements Action {
  readonly type = ActionTypes.LOGOUT_USER;
}
export class SetUserAction implements Action {
  readonly type = ActionTypes.SET_USER;
  constructor(public request: SetUserStore) {}
}
export class DeleteUserAction implements Action {
  readonly type = ActionTypes.DELETE_USER;
  constructor(public request: DeleteUserStore) {}
}

// Location
export class SetLoadingLocationAction implements Action {
  readonly type = ActionTypes.SET_LOADING_LOCATION;
  constructor(public request: SetLoadingLocation) {}
}
export class SetLocationAction implements Action {
  readonly type = ActionTypes.SET_LOCATION;
  constructor(public request: SetLocation) {}
}
export class SetLocationFailureAction implements Action {
  readonly type = ActionTypes.SET_LOCATION_FAILURE;
  constructor(public request: SetLocationFailure) {}
}

// Metadata
export class GetUserMetadataRequestAction implements Action {
  readonly type = ActionTypes.GET_METADATA_REQUEST;
  constructor(public request: GetUserMetadataRequest) {}
}
export class GetUserMetadataRequestSuccess implements Action {
  readonly type = ActionTypes.GET_METADATA_SUCCESS;
  constructor(public response: GetUserMetadataResponse) {}
}
export class GetUserMetadataFailureAction implements Action {
  readonly type = ActionTypes.GET_METADATA_FAILURE;
  constructor(public error: SpotError) {}
}
export class UpdateUserMetadataRequestAction implements Action {
  readonly type = ActionTypes.UPDATE_METADATA_REQUEST;
  constructor(public request: UpdateUserMetadataRequest) {}
}
export class UpdateUserMetadataRequestSuccess implements Action {
  readonly type = ActionTypes.UPDATE_METADATA_SUCCESS;
  constructor(public response: UpdateUserMetadataResponse) {}
}
export class UpdateUserMetadataRequestFailure implements Action {
  readonly type = ActionTypes.UPDATE_METADATA_FAILURE;
  constructor(public error: SpotError) {}
}

export type Actions =
  // User
  | GetUserRequestAction
  | GetUserSuccessAction
  | GetUserFailureAction
  | LogoutUserAction
  | SetUserAction
  | DeleteUserAction
  // Location
  | SetLocationAction
  | SetLoadingLocationAction
  | SetLocationFailureAction
  // Metadata
  | UpdateUserMetadataRequestAction
  | UpdateUserMetadataRequestSuccess
  | UpdateUserMetadataRequestFailure
  | GetUserMetadataRequestAction
  | GetUserMetadataRequestSuccess
  | GetUserMetadataFailureAction
  // Generic
  | ResetStoreAction;
