import { Action } from '@ngrx/store';

export enum FacebookActionTypes {
    FACEBOOK_LOGIN_REQUEST = '[Users Facebook] Facebook Login Request',
    FACEBOOK_LOGIN_SUCCESS = '[Users Facebook] Facebook Login Success',
    FACEBOOK_LOGIN_FAILURE = '[Users Facebook] Facebook Login Failure'
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

export type FacebookActions = FacebookLoginRequestAction | FacebookLoginSuccessAction | FacebookLoginFailureAction;
