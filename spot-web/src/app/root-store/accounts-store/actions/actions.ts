import { Action } from '@ngrx/store';

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
  ACCOUNT_FAILURE = '[Accounts] Account Failure'
}

export class AuthenticateRequestAction implements Action {
    readonly type = ActionTypes.LOGIN_REQUEST;
    constructor(public request: any) {}
}

export class AuthenticateSuccessAction implements Action {
    readonly type = ActionTypes.LOGIN_SUCCESS;
    constructor(public payload: { response: any }) {}
}

export class AuthenticateFailureAction implements Action {
    readonly type = ActionTypes.LOGIN_FAILURE;
    constructor(public payload: { error: string }) {}
}

export class RegisterRequestAction implements Action {
    readonly type = ActionTypes.REGISTER_REQUEST;
    constructor(public request: any) {}
}

export class RegisterSuccessAction implements Action {
    readonly type = ActionTypes.REGISTER_SUCCESS;
    constructor(public payload: { response: any }) {}
}

export class RegisterFailureAction implements Action {
    readonly type = ActionTypes.REGISTER_FAILURE;
    constructor(public payload: { error: string }) {}
}

export class LogoutRequestAction implements Action {
    readonly type = ActionTypes.LOGOUT_REQUEST;
}

export class LogoutSuccessAction implements Action {
    readonly type = ActionTypes.LOGOUT_SUCCESS;
}

export class LogoutFailureAction implements Action {
    readonly type = ActionTypes.LOGOUT_FAILURE;
    constructor(public payload: { error: string }) {}
}

export class DeleteRequestAction implements Action {
    readonly type = ActionTypes.DELETE_REQUEST;
}

export class DeleteSuccessAction implements Action {
    readonly type = ActionTypes.DELETE_SUCCESS;
}

export class DeleteFailureAction implements Action {
    readonly type = ActionTypes.DELETE_FAILURE;
    constructor(public payload: { error: string }) {}
}

export class AccountRequestAction implements Action {
    readonly type = ActionTypes.ACCOUNT_REQUEST;
}

export class AccountSuccessAction implements Action {
    readonly type = ActionTypes.ACCOUNT_SUCCESS;
    constructor(public payload: { response: any }) {}
}

export class AccountFailureAction implements Action {
    readonly type = ActionTypes.ACCOUNT_FAILURE;
    constructor(public payload: { error: string }) {}
}

export type Actions = AuthenticateRequestAction | AuthenticateSuccessAction |
                      AuthenticateFailureAction | RegisterRequestAction |
                      RegisterSuccessAction | RegisterFailureAction |
                      LogoutRequestAction | LogoutSuccessAction |
                      LogoutFailureAction | DeleteRequestAction |
                      DeleteSuccessAction | DeleteFailureAction |
                      AccountRequestAction | AccountSuccessAction |
                      AccountFailureAction;
