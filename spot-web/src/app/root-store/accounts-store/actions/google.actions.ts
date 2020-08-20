import { Action } from '@ngrx/store';

import { GoogleLoginRequest, GoogleLoginResponse } from '@models/authentication';
import { SpotError } from '@exceptions/error';

export enum GoogleActionTypes {
    GOOGLE_LOGIN_REQUEST = '[Users Google] Google Login Request',
    GOOGLE_LOGIN_SUCCESS = '[Users Google] Google Login Success',
    GOOGLE_LOGIN_FAILURE = '[Users Google] Google Login Failure'
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

export type GoogleActions = GoogleLoginRequestAction | GoogleLoginSuccessAction | GoogleLoginFailureAction;
