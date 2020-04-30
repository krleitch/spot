import { Action } from '@ngrx/store';

import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse } from '@models/authentication';
import { SetLocationRequest, UpdateUsernameRequest, UpdateUsernameResponse, GetAccountRequest, GetAccountSuccess } from '@models/accounts';

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
  SET_LOCATION = '[Accounts] Set Location',
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
    constructor(public error: any) {}
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

export class SetLocationAction implements Action {
  readonly type = ActionTypes.SET_LOCATION;
  constructor(public request: SetLocationRequest) {}
}

export class UpdateUsernameAction implements Action {
  readonly type = ActionTypes.UPDATE_USERNAME_REQUEST;
  constructor(public request: UpdateUsernameRequest) {}
}

export class UpdateUsernameSuccessAction implements Action {
  readonly type = ActionTypes.UPDATE_USERNAME_SUCCESS;
  constructor(public response: UpdateUsernameResponse) {}
}

export type Actions = LoginRequestAction | LoginSuccessAction |
                      LoginFailureAction | RegisterRequestAction |
                      RegisterSuccessAction | RegisterFailureAction |
                      LogoutRequestAction | DeleteRequestAction |
                      DeleteSuccessAction | DeleteFailureAction |
                      AccountRequestAction | AccountSuccessAction |
                      SetLocationAction | AccountFailureAction |
                      UpdateUsernameAction | UpdateUsernameSuccessAction |
                      GenericFailureAction;
