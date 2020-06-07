import { Action } from '@ngrx/store';

import { FacebookConnectRequest, FacebookConnectResponse, FacebookDisconnectRequest, FacebookDisconnectResponse } from '@models/accounts';
import { SpotError } from '@exceptions/error';

export enum FacebookActionTypes {
    FACEBOOK_LOGIN_REQUEST = '[Users Facebook] Facebook Login Request',
    FACEBOOK_LOGIN_SUCCESS = '[Users Facebook] Facebook Login Success',
    FACEBOOK_LOGIN_FAILURE = '[Users Facebook] Facebook Login Failure',
    FACEBOOK_CONNECT_REQUEST = '[Users Facebook] Facebook Connect Request',
    FACEBOOK_CONNECT_SUCCESS = '[Users Facebook] Facebook Connect Success',
    FACEBOOK_CONNECT_FAILURE = '[Users Facebook] Facebook Connect Failure',
    FACEBOOK_DISCONNECT_REQUEST = '[Users Facebook] Facebook Disconnect Request',
    FACEBOOK_DISCONNECT_SUCCESS = '[Users Facebook] Facebook Disconnect Success',
    FACEBOOK_DISCONNECT_FAILURE = '[Users Facebook] Facebook Disconnect Failure'
}

export class FacebookLoginRequestAction implements Action {
    readonly type = FacebookActionTypes.FACEBOOK_LOGIN_REQUEST;
    constructor(public request: any) {}
}

export class FacebookLoginSuccessAction implements Action {
    readonly type = FacebookActionTypes.FACEBOOK_LOGIN_SUCCESS;
    constructor(public response: any) {}
}

export class FacebookLoginFailureAction implements Action {
    readonly type = FacebookActionTypes.FACEBOOK_LOGIN_FAILURE;
    constructor(public error: string) {}
}

export class FacebookConnectRequestAction implements Action {
  readonly type = FacebookActionTypes.FACEBOOK_CONNECT_REQUEST;
  constructor(public request: FacebookConnectRequest) {}
}

export class FacebookConnectSuccessAction implements Action {
  readonly type = FacebookActionTypes.FACEBOOK_CONNECT_SUCCESS;
  constructor(public response: FacebookConnectResponse) {}
}

export class FacebookConnectFailureAction implements Action {
  readonly type = FacebookActionTypes.FACEBOOK_CONNECT_FAILURE;
  constructor(public error: SpotError) {}
}

export class FacebookDisconnectRequestAction implements Action {
  readonly type = FacebookActionTypes.FACEBOOK_DISCONNECT_REQUEST;
  constructor(public request: FacebookDisconnectRequest) {}
}

export class FacebookDisconnectSuccessAction implements Action {
  readonly type = FacebookActionTypes.FACEBOOK_DISCONNECT_SUCCESS;
  constructor(public response: FacebookDisconnectResponse) {}
}

export class FacebookDisconnectFailureAction implements Action {
  readonly type = FacebookActionTypes.FACEBOOK_DISCONNECT_FAILURE;
  constructor(public error: SpotError) {}
}

export type FacebookActions = FacebookLoginRequestAction | FacebookLoginSuccessAction | FacebookLoginFailureAction |
                              FacebookConnectRequestAction | FacebookConnectSuccessAction | FacebookConnectFailureAction |
                              FacebookDisconnectRequestAction | FacebookDisconnectSuccessAction | FacebookDisconnectFailureAction;
