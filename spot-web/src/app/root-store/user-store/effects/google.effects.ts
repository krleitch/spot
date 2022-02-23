import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// store
import * as googleActions from '../actions/google.actions';
import * as featureActions from '../actions/actions';
import * as friendsActions from '../../social-store/actions/friends.actions';

// services
import { AuthenticationService } from '@services/authentication.service';
import { UserService } from '@src/app/services/user.service';

// models
import { GoogleLoginResponse } from '@models/../newModels/authentication';
import {
  GoogleConnectResponse,
  GoogleDisconnectResponse
} from '@models/../newModels/user';

@Injectable()
export class GoogleStoreEffects {
  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private actions$: Actions
  ) {}

  @Effect()
  loginGoogleUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleLoginRequestAction>(
      googleActions.GoogleActionTypes.GOOGLE_LOGIN_REQUEST
    ),
    switchMap((action) =>
      this.authenticationService.loginGoogleUser(action.request).pipe(
        map(
          (response: GoogleLoginResponse) =>
            new googleActions.GoogleLoginSuccessAction(response)
        ),
        catchError((error) =>
          observableOf(new googleActions.GoogleLoginFailureAction(error))
        )
      )
    )
  );

  @Effect()
  loginGoogleUserSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleLoginSuccessAction>(
      googleActions.GoogleActionTypes.GOOGLE_LOGIN_SUCCESS
    ),
    tap((action: googleActions.GoogleLoginSuccessAction) => {
      this.authenticationService.loginGoogleUserSuccess(action.response);
    }),
    switchMap((action: googleActions.GoogleLoginSuccessAction) => [
      new friendsActions.GetFriendsRequestAction({
        date: new Date().toString(),
        limit: null
      }),
      new featureActions.GetUserMetadataRequestAction({})
    ])
  );

  @Effect()
  connectGoogleUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleConnectRequestAction>(
      googleActions.GoogleActionTypes.GOOGLE_CONNECT_REQUEST
    ),
    switchMap((action) =>
      this.userService.connectGoogleUser(action.request).pipe(
        map(
          (response: GoogleConnectResponse) =>
            new googleActions.GoogleConnectSuccessAction(response)
        ),
        catchError((error) =>
          observableOf(new googleActions.GoogleConnectFailureAction(error))
        )
      )
    )
  );

  @Effect({ dispatch: false })
  connectGoogleUserSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleConnectSuccessAction>(
      googleActions.GoogleActionTypes.GOOGLE_CONNECT_SUCCESS
    ),
    tap((action: googleActions.GoogleConnectSuccessAction) => {
      // this.authenticationService.loginGoogleUserSuccess(action.response);
    })
  );

  @Effect()
  disconnectGoogleUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleDisconnectRequestAction>(
      googleActions.GoogleActionTypes.GOOGLE_DISCONNECT_REQUEST
    ),
    switchMap((action) =>
      this.userService.disconnectGoogleUser(action.request).pipe(
        map(
          (response: GoogleDisconnectResponse) =>
            new googleActions.GoogleDisconnectSuccessAction(response)
        ),
        catchError((error) =>
          observableOf(new googleActions.GoogleDisconnectFailureAction(error))
        )
      )
    )
  );

  @Effect({ dispatch: false })
  disconnectGoogleUserSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleDisconnectSuccessAction>(
      googleActions.GoogleActionTypes.GOOGLE_DISCONNECT_SUCCESS
    ),
    tap((action: googleActions.GoogleDisconnectSuccessAction) => {
      // this.authenticationService.loginGoogleUserSuccess(action.response);
    })
  );
}
