import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// store
import * as facebookActions from '../actions/facebook.actions';
import * as featureActions from '../actions/actions';
import * as friendActions from '../../social-store/actions/friend.actions';

// services
import { UserService } from '@src/app/services/user.service';
import { AlertService } from '@services/alert.service';
import { AuthenticationService } from '@services/authentication.service';

// models
import { FacebookLoginResponse } from '@models/authentication';
import {
  FacebookConnectResponse,
  FacebookDisconnectResponse
} from '@models/user';
import { SpotError } from '@exceptions/error';

@Injectable()
export class FacebookStoreEffects {
  constructor(
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private userService: UserService,
    private actions$: Actions
  ) {}

  loginFacebookUserRequestEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<facebookActions.FacebookLoginRequestAction>(
        facebookActions.FacebookActionTypes.FACEBOOK_LOGIN_REQUEST
      ),
      switchMap((action) =>
        this.authenticationService.loginFacebookUser(action.request).pipe(
          map(
            (response: FacebookLoginResponse) =>
              new facebookActions.FacebookLoginSuccessAction(response)
          ),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new facebookActions.FacebookLoginFailureAction(
                errorResponse.error
              )
            )
          )
        )
      )
    )
  );

  loginFacebookUserSuccessEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<facebookActions.FacebookLoginSuccessAction>(
        facebookActions.FacebookActionTypes.FACEBOOK_LOGIN_SUCCESS
      ),
      tap((action) => {
        this.authenticationService.loginFacebookUserSuccess(action.response);
      }),
      switchMap((_action) => [
        new friendActions.GetFriendsRequestAction({
          limit: null
        }),
        new featureActions.GetUserMetadataRequestAction({})
      ])
    )
  );

  connectFacebookUserRequestEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<facebookActions.FacebookConnectRequestAction>(
        facebookActions.FacebookActionTypes.FACEBOOK_CONNECT_REQUEST
      ),
      switchMap((action) =>
        this.userService.connectFacebookUser(action.request).pipe(
          map(
            (response: FacebookConnectResponse) =>
              new facebookActions.FacebookConnectSuccessAction(response)
          ),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new facebookActions.FacebookConnectFailureAction(
                errorResponse.error
              )
            )
          )
        )
      )
    )
  );

  connectFacebookUserSuccessEffect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<facebookActions.FacebookConnectSuccessAction>(
          facebookActions.FacebookActionTypes.FACEBOOK_CONNECT_SUCCESS
        ),
        tap((_action) => {
          // none
        })
      ),
    { dispatch: false }
  );

  connectFacebookUserFailureEffect = createEffect(
    () =>
      this.actions$.pipe(
        ofType<facebookActions.FacebookConnectFailureAction>(
          facebookActions.FacebookActionTypes.FACEBOOK_CONNECT_FAILURE
        ),
        tap((action) => {
          // none
        })
      ),
    { dispatch: false }
  );

  disconnectFacebookUserRequestEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<facebookActions.FacebookDisconnectRequestAction>(
        facebookActions.FacebookActionTypes.FACEBOOK_DISCONNECT_REQUEST
      ),
      switchMap((action) =>
        this.userService.disconnectFacebookUser(action.request).pipe(
          map(
            (response: FacebookDisconnectResponse) =>
              new facebookActions.FacebookDisconnectSuccessAction(response)
          ),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new facebookActions.FacebookDisconnectFailureAction(
                errorResponse.error
              )
            )
          )
        )
      )
    )
  );

  disconnectFacebookUserSuccessEffect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<facebookActions.FacebookDisconnectSuccessAction>(
          facebookActions.FacebookActionTypes.FACEBOOK_DISCONNECT_SUCCESS
        ),
        tap((_action) => {
          // empty
        })
      ),
    { dispatch: false }
  );
}
