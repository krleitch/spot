import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as googleActions from '../actions/google.actions';
import * as featureActions from '../actions/actions';
import * as friendsActions from '../../social-store/actions/friends.actions';
import { AuthenticationService } from '@services/authentication.service';
import { AccountsService } from '@services/accounts.service';
import { GoogleLoginResponse } from '@models/authentication';
import { GoogleConnectResponse, GoogleDisconnectResponse } from '@models/accounts';

@Injectable()
export class GoogleStoreEffects {
  constructor(private authenticationService: AuthenticationService,
              private accountsService: AccountsService,
              private actions$: Actions) { }

  @Effect()
  loginGoogleAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleLoginRequestAction>(
      googleActions.GoogleActionTypes.GOOGLE_LOGIN_REQUEST
    ),
    switchMap(action =>
      this.authenticationService
        .loginGoogleAccount(action.request)
        .pipe(
          map( (response: GoogleLoginResponse) =>
            new googleActions.GoogleLoginSuccessAction(response)
          ),
          catchError(error =>
            observableOf(new googleActions.GoogleLoginFailureAction(error))
          )
        )
    )
  );

  @Effect()
  loginGoogleAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleLoginSuccessAction>(
      googleActions.GoogleActionTypes.GOOGLE_LOGIN_SUCCESS
    ),
    tap( (action: googleActions.GoogleLoginSuccessAction) => {
      this.authenticationService.loginGoogleAccountSuccess(action.response);
    }),
    switchMap ( (action: googleActions.GoogleLoginSuccessAction) => [
      new friendsActions.GetFriendsRequestAction({ date: new Date().toString(), limit: null }),
      new featureActions.GetAccountMetadataRequestAction({})
    ])
  );

  @Effect()
  connectGoogleAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleConnectRequestAction>(
      googleActions.GoogleActionTypes.GOOGLE_CONNECT_REQUEST
    ),
    switchMap( action =>
      this.accountsService
        .connectGoogleAccount( action.request)
        .pipe(
            map( (response: GoogleConnectResponse) => new googleActions.GoogleConnectSuccessAction(response)),
            catchError(error =>
              observableOf(new googleActions.GoogleConnectFailureAction(error))
            )
        )
    )
  );

  @Effect({dispatch: false})
  connectGoogleAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleConnectSuccessAction>(
      googleActions.GoogleActionTypes.GOOGLE_CONNECT_SUCCESS
    ),
    tap( (action: googleActions.GoogleConnectSuccessAction) => {
      // this.authenticationService.loginGoogleAccountSuccess(action.response);
    })
  );

  @Effect()
  disconnectGoogleAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleDisconnectRequestAction>(
      googleActions.GoogleActionTypes.GOOGLE_DISCONNECT_REQUEST
    ),
    switchMap( action =>
      this.accountsService
        .disconnectGoogleAccount( action.request)
        .pipe(
            map( (response: GoogleDisconnectResponse) => new googleActions.GoogleDisconnectSuccessAction(response)),
            catchError(error =>
              observableOf(new googleActions.GoogleDisconnectFailureAction(error))
            )
        )
    )
  );

  @Effect({dispatch: false})
  disconnectGoogleAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleDisconnectSuccessAction>(
      googleActions.GoogleActionTypes.GOOGLE_DISCONNECT_SUCCESS
    ),
    tap( (action: googleActions.GoogleDisconnectSuccessAction) => {
      // this.authenticationService.loginGoogleAccountSuccess(action.response);
    })
  );

}
