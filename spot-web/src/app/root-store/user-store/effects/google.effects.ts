import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// store
import * as googleActions from '../actions/google.actions';
import * as featureActions from '../actions/actions';
import * as friendActions from '../../social-store/actions/friend.actions';

// services
import { AuthenticationService } from '@services/authentication.service';
import { UserService } from '@services/user.service';

// models
import { GoogleLoginResponse } from '@models/authentication';
import { GoogleConnectResponse, GoogleDisconnectResponse } from '@models/user';
import { SpotError } from '@exceptions/error';

@Injectable()
export class GoogleStoreEffects {
  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private actions$: Actions
  ) {}

  loginGoogleUserRequestEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<googleActions.GoogleLoginRequestAction>(
        googleActions.GoogleActionTypes.GOOGLE_LOGIN_REQUEST
      ),
      switchMap((action) =>
        this.authenticationService.loginGoogleUser(action.request).pipe(
          map(
            (response: GoogleLoginResponse) =>
              new googleActions.GoogleLoginSuccessAction(response)
          ),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new googleActions.GoogleLoginFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  loginGoogleUserSuccessEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<googleActions.GoogleLoginSuccessAction>(
        googleActions.GoogleActionTypes.GOOGLE_LOGIN_SUCCESS
      ),
      tap((action) => {
        this.authenticationService.loginGoogleUserSuccess(action.response);
      }),
      switchMap((_action) => [
        new friendActions.GetFriendsRequestAction({
          limit: null
        }),
        new featureActions.GetUserMetadataRequestAction({})
      ])
    )
  );

  connectGoogleUserRequestEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<googleActions.GoogleConnectRequestAction>(
        googleActions.GoogleActionTypes.GOOGLE_CONNECT_REQUEST
      ),
      switchMap((action) =>
        this.userService.connectGoogleUser(action.request).pipe(
          map(
            (response: GoogleConnectResponse) =>
              new googleActions.GoogleConnectSuccessAction(response)
          ),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new googleActions.GoogleConnectFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  connectGoogleUserSuccessEffect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<googleActions.GoogleConnectSuccessAction>(
          googleActions.GoogleActionTypes.GOOGLE_CONNECT_SUCCESS
        ),
        tap((_action) => {
          // none
        })
      ),
    { dispatch: false }
  );

  disconnectGoogleUserRequestEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<googleActions.GoogleDisconnectRequestAction>(
        googleActions.GoogleActionTypes.GOOGLE_DISCONNECT_REQUEST
      ),
      switchMap((action) =>
        this.userService.disconnectGoogleUser(action.request).pipe(
          map(
            (response: GoogleDisconnectResponse) =>
              new googleActions.GoogleDisconnectSuccessAction(response)
          ),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new googleActions.GoogleDisconnectFailureAction(
                errorResponse.error
              )
            )
          )
        )
      )
    )
  );

  disconnectGoogleUserSuccessEffect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<googleActions.GoogleDisconnectSuccessAction>(
          googleActions.GoogleActionTypes.GOOGLE_DISCONNECT_SUCCESS
        ),
        tap((action) => {
          // none
        })
      ),
    { dispatch: false }
  );
}
