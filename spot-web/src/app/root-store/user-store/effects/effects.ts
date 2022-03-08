import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// Store
import * as userActions from '@src/app/root-store/user-store/actions/actions';
import * as friendActions from '@src/app/root-store/social-store/actions/friend.actions';
import * as spotActions from '@src/app/root-store/spot-store/actions';
import * as commentActions from '@src/app/root-store/comment-store/actions';
import * as socialActions from '@store/social-store/actions/actions';

// Services
import { AuthenticationService } from '@services/authentication.service';
import { UserService } from '@src/app/services/user.service';
import { ThemeService } from '@services/theme.service';

// Models
import { VerifyResponse } from '@models/user';
import { GetUserMetadataResponse, ThemeWeb } from '@models/userMetadata';
import { SpotError } from '@exceptions/error';
@Injectable()
export class UserStoreEffects {
  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private themeService: ThemeService,
    private actions$: Actions
  ) {}

  @Effect({ dispatch: false })
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.GenericFailureAction>(
      userActions.ActionTypes.GENERIC_FAILURE
    ),
    tap((action: userActions.GenericFailureAction) => {
      if (action.error.name === 'LocationError ') {
        this.userService.failureMessage('You are using an invalid location');
      } else {
        this.userService.failureMessage('Oops... Somethings went wrong');
      }
    })
  );

  @Effect()
  registerUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.RegisterRequestAction>(
      userActions.ActionTypes.REGISTER_REQUEST
    ),
    switchMap((registerRequest: userActions.RegisterRequestAction) =>
      this.authenticationService.registerUser(registerRequest.request).pipe(
        map((response) => new userActions.RegisterSuccessAction(response)),
        catchError((errorResponse: any) =>
          observableOf(
            new userActions.RegisterFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  registerUserSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.RegisterSuccessAction>(
      userActions.ActionTypes.REGISTER_SUCCESS
    ),
    tap((action: userActions.RegisterSuccessAction) => {
      this.authenticationService.registerUserSuccess(action.response);
    }),
    switchMap((action: userActions.RegisterSuccessAction) => [
      new friendActions.GetFriendsRequestAction({
        limit: null
      }),
      new userActions.GetUserMetadataRequestAction({})
    ])
  );

  @Effect()
  loginUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.LoginRequestAction>(
      userActions.ActionTypes.LOGIN_REQUEST
    ),
    switchMap((authenticateRequest) =>
      this.authenticationService.loginUser(authenticateRequest.request).pipe(
        map((response) => new userActions.LoginSuccessAction(response)),
        catchError((errorResponse) =>
          observableOf(new userActions.LoginFailureAction(errorResponse.error))
        )
      )
    )
  );

  @Effect()
  loginUserSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.LoginSuccessAction>(
      userActions.ActionTypes.LOGIN_SUCCESS
    ),
    tap((action: userActions.LoginSuccessAction) => {
      this.authenticationService.loginUserSuccess(action.response);
    }),
    switchMap((action: userActions.LoginSuccessAction) => [
      new friendActions.GetFriendsRequestAction({
        limit: null
      }),
      new userActions.GetUserMetadataRequestAction({})
    ])
  );

  @Effect()
  logoutUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.LogoutRequestAction>(
      userActions.ActionTypes.LOGOUT_REQUEST
    ),
    tap((logoutRequest: userActions.LogoutRequestAction) => {
      this.authenticationService.logoutUserSuccess();
    }),
    switchMap((action: userActions.LogoutRequestAction) => [
      new userActions.ResetStoreAction(),
      new spotActions.ResetStoreAction(),
      new commentActions.ResetStoreAction(),
      new socialActions.ResetStoreAction()
    ])
  );

  @Effect()
  deleteUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.DeleteRequestAction>(
      userActions.ActionTypes.DELETE_REQUEST
    ),
    switchMap((deleteRequest) =>
      this.userService.deleteUser({}).pipe(
        map((response) => {
          return new userActions.DeleteSuccessAction();
        }),
        catchError((error) =>
          observableOf(new userActions.DeleteFailureAction(error))
        )
      )
    )
  );

  @Effect({ dispatch: false })
  deleteUserSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.DeleteSuccessAction>(
      userActions.ActionTypes.DELETE_SUCCESS
    ),
    tap((deleteRequest) => {
      this.userService.onDeleteUserSuccess();
    })
  );

  @Effect()
  getUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.UserRequestAction>(userActions.ActionTypes.USER_REQUEST),
    switchMap((action) =>
      this.userService.getUser({}).pipe(
        tap((response) => {
          this.userService.getUserRedirect();
        }),
        map((response) => new userActions.UserSuccessAction(response)),
        catchError((error) =>
          observableOf(new userActions.UserFailureAction(error))
        )
      )
    )
  );

  @Effect()
  getUserSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.UserSuccessAction>(userActions.ActionTypes.USER_SUCCESS),
    tap((action: userActions.UserSuccessAction) => {
      // none
    }),
    switchMap((action: userActions.UserSuccessAction) => [
      new friendActions.GetFriendsRequestAction({
        limit: null
      }),
      new userActions.GetUserMetadataRequestAction({})
    ])
  );

  @Effect()
  updateUserMetadataEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.UpdateUserMetadataRequestAction>(
      userActions.ActionTypes.UPDATE_METADATA_REQUEST
    ),
    switchMap((action) =>
      this.userService.updateUserMetadata(action.request).pipe(
        map((response) => {
          return new userActions.UpdateUserMetadataRequestSuccess(response);
        }),
        catchError((errorResponse) =>
          observableOf(
            new userActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  getUserMetadataEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.GetUserMetadataRequestAction>(
      userActions.ActionTypes.GET_METADATA_REQUEST
    ),
    switchMap((action: userActions.GetUserMetadataRequestAction) =>
      this.userService.getUserMetadata(action.request).pipe(
        map((response: GetUserMetadataResponse) => {
          if (response.metadata.themeWeb === ThemeWeb.DARK) {
            this.themeService.setDarkTheme();
          } else {
            this.themeService.setLightTheme();
          }
          return new userActions.GetUserMetadataRequestSuccess(response);
        }),
        catchError((errorResponse: { error: SpotError }) =>
          observableOf(
            new userActions.GetUserMetadataFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  verifyUserEffect$: Observable<Action> = this.actions$.pipe(
    ofType<userActions.VerifyRequestAction>(
      userActions.ActionTypes.VERIFY_REQUEST
    ),
    switchMap((action) =>
      this.userService.verifyUser(action.request).pipe(
        map(
          (response: VerifyResponse) =>
            new userActions.VerifySuccessAction(response)
        ),
        catchError((errorResponse) =>
          observableOf(
            new userActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );
}
