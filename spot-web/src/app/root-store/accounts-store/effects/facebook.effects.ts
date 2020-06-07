import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as facebookActions from '../actions/facebook.actions';
import { AuthenticationService } from '@services/authentication.service';
import { AccountsService } from '@services/accounts.service';
import { FacebookLoginResponse } from '@models/authentication';
import { FacebookConnectResponse, FacebookDisconnectResponse } from '@models/accounts';

@Injectable()
export class FacebookStoreEffects {
  constructor(private authenticationService: AuthenticationService,
              private accountsService: AccountsService,
              private actions$: Actions) { }

  @Effect()
  loginFacebookAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookLoginRequestAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_LOGIN_REQUEST
    ),
    switchMap(loginRequest =>
      this.authenticationService
        .loginFacebookAccount(loginRequest.request)
        .pipe(
            map( (response: FacebookLoginResponse) => new facebookActions.FacebookLoginSuccessAction(response)),
            catchError(error =>
              observableOf(new facebookActions.FacebookLoginFailureAction(error))
            )
        )
    )
  );

  @Effect({dispatch: false})
  loginFacebookAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookLoginSuccessAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_LOGIN_SUCCESS
    ),
    tap( (action: facebookActions.FacebookLoginSuccessAction) => {
      this.authenticationService.loginFacebookAccountSuccess(action.response);
    })
  );

  @Effect()
  connectFacebookAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookConnectRequestAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_CONNECT_REQUEST
    ),
    switchMap( action =>
      this.accountsService
        .connectFacebookAccount( action.request)
        .pipe(
            map( (response: FacebookConnectResponse) => new facebookActions.FacebookConnectSuccessAction(response)),
            catchError(error =>
              observableOf(new facebookActions.FacebookConnectFailureAction(error))
            )
        )
    )
  );

  @Effect({dispatch: false})
  connectFacebookAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookConnectSuccessAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_CONNECT_SUCCESS
    ),
    tap( (action: facebookActions.FacebookConnectSuccessAction) => {
      // this.authenticationService.loginFacebookAccountSuccess(action.response);
    })
  );

  @Effect()
  disconnectFacebookAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookDisconnectRequestAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_DISCONNECT_REQUEST
    ),
    switchMap( action =>
      this.accountsService
        .disconnectFacebookAccount( action.request)
        .pipe(
            map( (response: FacebookDisconnectResponse) => new facebookActions.FacebookDisconnectSuccessAction(response)),
            catchError(error =>
              observableOf(new facebookActions.FacebookDisconnectFailureAction(error))
            )
        )
    )
  );

  @Effect({dispatch: false})
  disconnectFacebookAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookDisconnectSuccessAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_DISCONNECT_SUCCESS
    ),
    tap( (action: facebookActions.FacebookDisconnectSuccessAction) => {
      // this.authenticationService.loginFacebookAccountSuccess(action.response);
    })
  );

}
