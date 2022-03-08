import { Action } from '@ngrx/store';

import {
  GoogleLoginRequest,
  GoogleLoginResponse
} from '@models/authentication';
import {
  GoogleConnectRequest,
  GoogleConnectResponse,
  GoogleDisconnectRequest,
  GoogleDisconnectResponse
} from '@models/user';
import { SpotError } from '@exceptions/error';

export enum GoogleActionTypes {
  GOOGLE_LOGIN_REQUEST = '[Users Google] Google Login Request',
  GOOGLE_LOGIN_SUCCESS = '[Users Google] Google Login Success',
  GOOGLE_LOGIN_FAILURE = '[Users Google] Google Login Failure',
  GOOGLE_CONNECT_REQUEST = '[Users Google] Google Connect Request',
  GOOGLE_CONNECT_SUCCESS = '[Users Google] Google Connect Success',
  GOOGLE_CONNECT_FAILURE = '[Users Google] Google Connect Failure',
  GOOGLE_DISCONNECT_REQUEST = '[Users Google] Google Disconnect Request',
  GOOGLE_DISCONNECT_SUCCESS = '[Users Google] Google Disconnect Success',
  GOOGLE_DISCONNECT_FAILURE = '[Users Google] Google Disconnect Failure'
}

export class GoogleLoginRequestAction implements Action {
  readonly type = GoogleActionTypes.GOOGLE_LOGIN_REQUEST;
  constructor(public request: GoogleLoginRequest) {}
}

export class GoogleLoginSuccessAction implements Action {
  readonly type = GoogleActionTypes.GOOGLE_LOGIN_SUCCESS;
  constructor(public response: GoogleLoginResponse) {}
}

export class GoogleLoginFailureAction implements Action {
  readonly type = GoogleActionTypes.GOOGLE_LOGIN_FAILURE;
  constructor(public error: SpotError) {}
}

export class GoogleConnectRequestAction implements Action {
  readonly type = GoogleActionTypes.GOOGLE_CONNECT_REQUEST;
  constructor(public request: GoogleConnectRequest) {}
}

export class GoogleConnectSuccessAction implements Action {
  readonly type = GoogleActionTypes.GOOGLE_CONNECT_SUCCESS;
  constructor(public response: GoogleConnectResponse) {}
}

export class GoogleConnectFailureAction implements Action {
  readonly type = GoogleActionTypes.GOOGLE_CONNECT_FAILURE;
  constructor(public error: SpotError) {}
}

export class GoogleDisconnectRequestAction implements Action {
  readonly type = GoogleActionTypes.GOOGLE_DISCONNECT_REQUEST;
  constructor(public request: GoogleDisconnectRequest) {}
}

export class GoogleDisconnectSuccessAction implements Action {
  readonly type = GoogleActionTypes.GOOGLE_DISCONNECT_SUCCESS;
  constructor(public response: GoogleDisconnectResponse) {}
}

export class GoogleDisconnectFailureAction implements Action {
  readonly type = GoogleActionTypes.GOOGLE_DISCONNECT_FAILURE;
  constructor(public error: SpotError) {}
}

export type GoogleActions =
  | GoogleLoginRequestAction
  | GoogleLoginSuccessAction
  | GoogleLoginFailureAction
  | GoogleConnectRequestAction
  | GoogleConnectSuccessAction
  | GoogleConnectFailureAction
  | GoogleDisconnectRequestAction
  | GoogleDisconnectSuccessAction
  | GoogleDisconnectFailureAction;
