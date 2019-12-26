import { Action } from '@ngrx/store';

export enum FacebookActionTypes {
    FACEBOOK_REGISTER_REQUEST = '[Users Facebook] Facebook Register Request',
    FACEBOOK_REGISTER_SUCCESS = '[Users Facebook] Facebook Register Success',
    FACEBOOK_REGISTER_FAILURE = '[Users Facebook] Facebook Register Failure',
    FACEBOOK_LOGIN_REQUEST = '[Users Facebook] Facebook Login Request',
    FACEBOOK_LOGIN_SUCCESS = '[Users Facebook] Facebook Login Success',
    FACEBOOK_LOGIN_FAILURE = '[Users Facebook] Facebook Login Failure',
}

export class FacebookRegisterRequestAction implements Action {
    readonly type = FacebookActionTypes.FACEBOOK_REGISTER_REQUEST;
    constructor(public request: any) {}
}

export class FacebookRegisterSuccessAction implements Action {
    readonly type = FacebookActionTypes.FACEBOOK_REGISTER_SUCCESS;
    constructor(public response: any) {}
}

export class FacebookRegisterFailureAction implements Action {
    readonly type = FacebookActionTypes.FACEBOOK_REGISTER_FAILURE;
    constructor(public error: string) {}
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

export type FacebookActions = FacebookRegisterRequestAction | FacebookRegisterSuccessAction |
                              FacebookRegisterFailureAction | FacebookLoginRequestAction |
                              FacebookLoginSuccessAction | FacebookLoginFailureAction;
