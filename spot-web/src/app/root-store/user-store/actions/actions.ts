import { Action } from '@ngrx/store';

// Models
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from '@models/authentication';
import {
  GetUserRequest,
  GetUserResponse,
  UpdateEmailRequest,
  UpdatePhoneRequest,
  UpdateUsernameRequest,
  VerifyConfirmResponse,
  VerifyRequest,
  VerifyResponse,
  SetStoreUserProfilePicture
} from '@models/user';
import {
  GetUserMetadataRequest,
  GetUserMetadataResponse,
  UpdateUserMetadataRequest,
  UpdateUserMetadataResponse
} from '@models/userMetadata';
import {
  LoadLocationRequest,
  LocationFailure,
  SetLocationRequest
} from '@models/location';
import { SpotError } from '@exceptions/error';

export enum ActionTypes {
  RESET_STORE = '[User] Reset Store',
  LOGIN_REQUEST = '[User] Login Request',
  LOGIN_SUCCESS = '[User] Login Success',
  LOGIN_FAILURE = '[User] Login Failure',
  REGISTER_REQUEST = '[User] Register Request',
  REGISTER_SUCCESS = '[User] Register Success',
  REGISTER_FAILURE = '[User] Register Failure',
  LOGOUT_REQUEST = '[User] Logout Request',
  DELETE_REQUEST = '[User] Delete Request',
  DELETE_SUCCESS = '[User] Delete Success',
  DELETE_FAILURE = '[User] Delete Failure',
  USER_REQUEST = '[User] User Request',
  USER_SUCCESS = '[User] User Success',
  USER_FAILURE = '[User] User Failure',
  UPDATE_USERNAME_REQUEST = '[User] Update Username Request',
  UPDATE_EMAIL_REQUEST = '[User] Update Email Request',
  UPDATE_PHONE_REQUEST = '[User] Update Phone Request',
  UPDATE_PROFILE_PICTURE = '[User] Update Profile Picture',
  DELETE_PROFILE_PICTURE_REQUEST = '[User] Delete Profile Picture Request',
  UPDATE_METADATA_REQUEST = '[User] Update Metadata Request',
  UPDATE_METADATA_SUCCESS = '[User] Update Metadata Success',
  UPDATE_METADATA_FAILURE = '[User] Update Metadata Failure',
  GET_METADATA_REQUEST = '[User] Get Metadata Request',
  GET_METADATA_SUCCESS = '[User] Get Metadata Success',
  GET_METADATA_FAILURE = '[User] Get Metadata Failure',
  LOAD_LOCATION = '[User] Load Location',
  SET_LOCATION = '[User] Set Location',
  LOCATION_FAILURE = '[User] Location Failure',
  VERIFY_REQUEST = '[User] Verify Request',
  VERIFY_SUCCESS = '[User] Verify Success',
  VERIFY_CONFIRM_REQUEST = '[User] Verify Confrim Request',
  GENERIC_FAILURE = '[User] Generic Failure'
}

export class ResetStoreAction implements Action {
  readonly type = ActionTypes.RESET_STORE;
  constructor() {}
}

export class GenericFailureAction implements Action {
  readonly type = ActionTypes.GENERIC_FAILURE;
  constructor(public error: SpotError) {}
}

export class RegisterRequestAction implements Action {
  readonly type = ActionTypes.REGISTER_REQUEST;
  constructor(public request: RegisterRequest) {}
}

export class RegisterSuccessAction implements Action {
  readonly type = ActionTypes.REGISTER_SUCCESS;
  constructor(public response: RegisterResponse) {}
}

export class RegisterFailureAction implements Action {
  readonly type = ActionTypes.REGISTER_FAILURE;
  constructor(public error: SpotError) {}
}

export class LoginRequestAction implements Action {
  readonly type = ActionTypes.LOGIN_REQUEST;
  constructor(public request: LoginRequest) {}
}

export class LoginSuccessAction implements Action {
  readonly type = ActionTypes.LOGIN_SUCCESS;
  constructor(public response: LoginResponse) {}
}

export class LoginFailureAction implements Action {
  readonly type = ActionTypes.LOGIN_FAILURE;
  constructor(public error: any) {}
}

export class LogoutRequestAction implements Action {
  readonly type = ActionTypes.LOGOUT_REQUEST;
}

export class DeleteRequestAction implements Action {
  readonly type = ActionTypes.DELETE_REQUEST;
}

export class DeleteSuccessAction implements Action {
  readonly type = ActionTypes.DELETE_SUCCESS;
}

export class DeleteFailureAction implements Action {
  readonly type = ActionTypes.DELETE_FAILURE;
  constructor(public error: string) {}
}

export class UserRequestAction implements Action {
  readonly type = ActionTypes.USER_REQUEST;
  constructor(public request: GetUserRequest) {}
}

export class UserSuccessAction implements Action {
  readonly type = ActionTypes.USER_SUCCESS;
  constructor(public response: GetUserResponse) {}
}

export class UserFailureAction implements Action {
  readonly type = ActionTypes.USER_FAILURE;
  constructor(public error: string) {}
}

export class LoadLocationAction implements Action {
  readonly type = ActionTypes.LOAD_LOCATION;
  constructor(public request: LoadLocationRequest) {}
}

export class SetLocationAction implements Action {
  readonly type = ActionTypes.SET_LOCATION;
  constructor(public request: SetLocationRequest) {}
}

export class LocationFailureAction implements Action {
  readonly type = ActionTypes.LOCATION_FAILURE;
  constructor(public request: LocationFailure) {}
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

export class VerifyRequestAction implements Action {
  readonly type = ActionTypes.VERIFY_REQUEST;
  constructor(public request: VerifyRequest) {}
}

export class VerifySuccessAction implements Action {
  readonly type = ActionTypes.VERIFY_SUCCESS;
  constructor(public response: VerifyResponse) {}
}

export class VerifyConfirmRequestAction implements Action {
  readonly type = ActionTypes.VERIFY_CONFIRM_REQUEST;
  // Its the response from the request, we just send to store
  constructor(public request: VerifyConfirmResponse) {}
}

export class UpdateUsernameAction implements Action {
  readonly type = ActionTypes.UPDATE_USERNAME_REQUEST;
  constructor(public request: UpdateUsernameRequest) {}
}
export class UpdateEmailAction implements Action {
  readonly type = ActionTypes.UPDATE_EMAIL_REQUEST;
  constructor(public request: UpdateEmailRequest) {}
}

export class UpdatePhoneAction implements Action {
  readonly type = ActionTypes.UPDATE_PHONE_REQUEST;
  constructor(public request: UpdatePhoneRequest) {}
}

export class UpdateProfilePictureAction implements Action {
  readonly type = ActionTypes.UPDATE_PROFILE_PICTURE;
  constructor(public request: SetStoreUserProfilePicture) {}
}

export type Actions =
  | LoginRequestAction
  | LoginSuccessAction
  | LoginFailureAction
  | RegisterRequestAction
  | RegisterSuccessAction
  | RegisterFailureAction
  | LogoutRequestAction
  | DeleteRequestAction
  | DeleteSuccessAction
  | DeleteFailureAction
  | UserRequestAction
  | UserSuccessAction
  | SetLocationAction
  | UserFailureAction
  | UpdateUsernameAction
  | UpdatePhoneAction
  | GenericFailureAction
  | UpdateUserMetadataRequestAction
  | UpdateUserMetadataRequestSuccess
  | GetUserMetadataRequestAction
  | GetUserMetadataRequestSuccess
  | GetUserMetadataFailureAction
  | LoadLocationAction
  | UpdateEmailAction
  | VerifyRequestAction
  | VerifySuccessAction
  | VerifyConfirmRequestAction
  | LocationFailureAction
  | UpdateProfilePictureAction
  | ResetStoreAction;
