import { Action } from '@ngrx/store';

import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse } from '@models/authentication';
import { SetLocationRequest, UpdateUsernameRequest, UpdateUsernameResponse, GetAccountRequest, GetAccountSuccess,
         UpdateAccountMetadataRequest, UpdateAccountMetadataSuccess, GetAccountMetadataRequest, GetAccountMetadataSuccess,
         LoadLocationRequest, VerifyConfirmRequest, VerifyConfirmResponse, VerifyRequest, VerifyResponse, LocationFailure } from '@models/accounts';
import { SpotError } from '@exceptions/error';

export enum ActionTypes {
  LOGIN_REQUEST = '[Accounts] Login Request',
  LOGIN_SUCCESS = '[Accounts] Login Success',
  LOGIN_FAILURE = '[Accounts] Login Failure',
  REGISTER_REQUEST = '[Accounts] Register Request',
  REGISTER_SUCCESS = '[Accounts] Register Success',
  REGISTER_FAILURE = '[Accounts] Register Failure',
  LOGOUT_REQUEST = '[Accounts] Logout Request',
  LOGOUT_SUCCESS = '[Accounts] Logout Success',
  LOGOUT_FAILURE = '[Accounts] Logout Failure',
  DELETE_REQUEST = '[Accounts] Delete Request',
  DELETE_SUCCESS = '[Accounts] Delete Success',
  DELETE_FAILURE = '[Accounts] Delete Failure',
  ACCOUNT_REQUEST = '[Accounts] Account Request',
  ACCOUNT_SUCCESS = '[Accounts] Account Success',
  ACCOUNT_FAILURE = '[Accounts] Account Failure',
  UPDATE_USERNAME_REQUEST = '[Accounts] Update Username Request',
  UPDATE_USERNAME_SUCCESS = '[Accounts] Update Username Success',
  UPDATE_USERNAME_FAILURE = '[Accounts] Update Username Failure',
  UPDATE_METADATA_REQUEST = '[Accounts] Update Metadata Request',
  UPDATE_METADATA_SUCCESS = '[Accounts] Update Metadata Success',
  GET_METADATA_REQUEST = '[Accounts] Get Metadata Request',
  GET_METADATA_SUCCESS = '[Accounts] Get Metadata Success',
  GET_METADATA_FAILURE = '[Accounts] Get Metadata Failure',
  LOAD_LOCATION = '[Accounts] Load Location',
  SET_LOCATION = '[Accounts] Set Location',
  LOCATION_FAILURE = '[Accounts] Location Failure',
  VERIFY_REQUEST = '[Accounts] Verify Request',
  VERIFY_SUCCESS = '[Accounts] Verify Success',
  VERIFY_CONFIRM_REQUEST = '[Accounts] Verify Confrim Request',
  VERIFY_CONFIRM_SUCCESS = '[Accounts] Verify Confirm Success',
  VERIFY_CONFIRM_FAILURE = '[Accounts] Verify Confirm Failure',
  GENERIC_FAILURE = '[Accounts] Generic Failure'
}

export class GenericFailureAction implements Action {
  readonly type = ActionTypes.GENERIC_FAILURE;
  constructor(public error: string) {}
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

export class AccountRequestAction implements Action {
    readonly type = ActionTypes.ACCOUNT_REQUEST;
    constructor(public request: GetAccountRequest) {}
}

export class AccountSuccessAction implements Action {
    readonly type = ActionTypes.ACCOUNT_SUCCESS;
    constructor(public response: GetAccountSuccess) {}
}

export class AccountFailureAction implements Action {
    readonly type = ActionTypes.ACCOUNT_FAILURE;
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

export class UpdateUsernameAction implements Action {
  readonly type = ActionTypes.UPDATE_USERNAME_REQUEST;
  constructor(public request: UpdateUsernameRequest) {}
}

export class UpdateUsernameSuccessAction implements Action {
  readonly type = ActionTypes.UPDATE_USERNAME_SUCCESS;
  constructor(public response: UpdateUsernameResponse) {}
}

export class UpdateUsernameFailureAction implements Action {
  readonly type = ActionTypes.UPDATE_USERNAME_FAILURE;
  constructor(public error: SpotError) {}
}

export class UpdateAccountMetadataRequestAction implements Action {
  readonly type = ActionTypes.UPDATE_METADATA_REQUEST;
  constructor(public request: UpdateAccountMetadataRequest) {}
}

export class UpdateAccountMetadataRequestSuccess implements Action {
  readonly type = ActionTypes.UPDATE_METADATA_SUCCESS;
  constructor(public response: UpdateAccountMetadataSuccess) {}
}

export class GetAccountMetadataRequestAction implements Action {
  readonly type = ActionTypes.GET_METADATA_REQUEST;
  constructor(public request: GetAccountMetadataRequest) {}
}

export class GetAccountMetadataRequestSuccess implements Action {
  readonly type = ActionTypes.GET_METADATA_SUCCESS;
  constructor(public response: GetAccountMetadataSuccess) {}
}

export class GetAccountMetadataFailureAction implements Action {
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
  constructor(public request: VerifyConfirmRequest) {}
}

export class VerifyConfirmSuccessAction implements Action {
  readonly type = ActionTypes.VERIFY_CONFIRM_SUCCESS;
  constructor(public response: VerifyConfirmResponse) {}
}

export class VerifyConfirmFailureAction implements Action {
  readonly type = ActionTypes.VERIFY_CONFIRM_FAILURE;
  constructor(public error: SpotError) {}
}

export type Actions = LoginRequestAction | LoginSuccessAction |
                      LoginFailureAction | RegisterRequestAction |
                      RegisterSuccessAction | RegisterFailureAction |
                      LogoutRequestAction | DeleteRequestAction |
                      DeleteSuccessAction | DeleteFailureAction |
                      AccountRequestAction | AccountSuccessAction |
                      SetLocationAction | AccountFailureAction |
                      UpdateUsernameAction | UpdateUsernameSuccessAction |
                      GenericFailureAction | UpdateAccountMetadataRequestAction |
                      UpdateAccountMetadataRequestSuccess | GetAccountMetadataRequestAction |
                      GetAccountMetadataRequestSuccess | GetAccountMetadataFailureAction |
                      LoadLocationAction | UpdateUsernameFailureAction |
                      VerifyRequestAction | VerifySuccessAction | VerifyConfirmRequestAction |
                      VerifyConfirmSuccessAction | LocationFailureAction | VerifyConfirmFailureAction;
