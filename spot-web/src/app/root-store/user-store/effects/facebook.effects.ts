import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
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
import { FacebookLoginResponse } from '@models/../newModels/authentication';
import {
  FacebookConnectResponse,
  FacebookDisconnectResponse
} from '@models/../newModels/user';

@Injectable()
export class FacebookStoreEffects {
  constructor(
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private userService: UserService,
    private actions$: Actions
  ) {}

  @Effect()
  loginFacebookUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookLoginRequestAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_LOGIN_REQUEST
    ),
    switchMap((loginRequest) =>
      this.authenticationService.loginFacebookUser(loginRequest.request).pipe(
        map(
          (response: FacebookLoginResponse) =>
            new facebookActions.FacebookLoginSuccessAction(response)
        ),
        catchError((error) =>
          observableOf(new facebookActions.FacebookLoginFailureAction(error))
        )
      )
    )
  );

  @Effect()
  loginFacebookUserSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookLoginSuccessAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_LOGIN_SUCCESS
    ),
    tap((action: facebookActions.FacebookLoginSuccessAction) => {
      this.authenticationService.loginFacebookUserSuccess(action.response);
    }),
    switchMap((action: facebookActions.FacebookLoginSuccessAction) => [
      new friendActions.GetFriendsRequestAction({
        limit: null
      }),
      new featureActions.GetUserMetadataRequestAction({})
    ])
  );

  @Effect()
  connectFacebookUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookConnectRequestAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_CONNECT_REQUEST
    ),
    switchMap((action) =>
      this.userService.connectFacebookUser(action.request).pipe(
        map(
          (response: FacebookConnectResponse) =>
            new facebookActions.FacebookConnectSuccessAction(response)
        ),
        catchError((errorResponse) =>
          observableOf(
            new facebookActions.FacebookConnectFailureAction(
              errorResponse.error
            )
          )
        )
      )
    )
  );

  @Effect({ dispatch: false })
  connectFacebookUserSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookConnectSuccessAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_CONNECT_SUCCESS
    ),
    tap((action: facebookActions.FacebookConnectSuccessAction) => {
      // this.authenticationService.loginFacebookUserSuccess(action.response);
    })
  );

  @Effect({ dispatch: false })
  connectFacebookUserFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookConnectFailureAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_CONNECT_FAILURE
    ),
    tap((action: facebookActions.FacebookConnectFailureAction) => {
      this.alertService.error(action.error.message);
    })
  );

  @Effect()
  disconnectFacebookUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookDisconnectRequestAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_DISCONNECT_REQUEST
    ),
    switchMap((action) =>
      this.userService.disconnectFacebookUser(action.request).pipe(
        map(
          (response: FacebookDisconnectResponse) =>
            new facebookActions.FacebookDisconnectSuccessAction(response)
        ),
        catchError((error) =>
          observableOf(
            new facebookActions.FacebookDisconnectFailureAction(error)
          )
        )
      )
    )
  );

  @Effect({ dispatch: false })
  disconnectFacebookUserSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookDisconnectSuccessAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_DISCONNECT_SUCCESS
    ),
    tap((action: facebookActions.FacebookDisconnectSuccessAction) => {
      // this.authenticationService.loginFacebookUserSuccess(action.response);
    })
  );
}
