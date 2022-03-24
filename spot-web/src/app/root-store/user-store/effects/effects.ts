import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// Store
import * as userActions from '@src/app/root-store/user-store/actions/actions';
import * as friendActions from '@src/app/root-store/social-store/actions/friend.actions';
import * as spotActions from '@src/app/root-store/spot-store/actions';
import * as commentActions from '@src/app/root-store/comment-store/actions';
import * as socialActions from '@store/social-store/actions/actions';
import * as chatActions from '@store/chat-store/actions';

// Services
import { AuthenticationService } from '@services/authentication.service';
import { UserService } from '@src/app/services/user.service';
import { ThemeService } from '@services/theme.service';

// Models
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

  GenericFailureEffect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<userActions.GenericFailureAction>(
          userActions.ActionTypes.GENERIC_FAILURE
        ),
        tap((_action) => {
          // none
        })
      ),
    { dispatch: false }
  );

  // User
  registerUserRequestEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<userActions.RegisterRequestAction>(
        userActions.ActionTypes.REGISTER_REQUEST
      ),
      switchMap((action) =>
        this.authenticationService.registerUser(action.request).pipe(
          map((response) => new userActions.RegisterSuccessAction(response)),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new userActions.RegisterFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  registerUserSuccessEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<userActions.RegisterSuccessAction>(
        userActions.ActionTypes.REGISTER_SUCCESS
      ),
      tap((action) => {
        this.authenticationService.registerUserSuccess(action.response);
      }),
      switchMap((_action) => [
        new friendActions.GetFriendsRequestAction({
          limit: null
        }),
        new userActions.GetUserMetadataRequestAction({})
      ])
    )
  );

  loginUserRequestEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<userActions.LoginRequestAction>(
        userActions.ActionTypes.LOGIN_REQUEST
      ),
      switchMap((action) =>
        this.authenticationService.loginUser(action.request).pipe(
          map((response) => new userActions.LoginSuccessAction(response)),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new userActions.LoginFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  loginUserSuccessEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<userActions.LoginSuccessAction>(
        userActions.ActionTypes.LOGIN_SUCCESS
      ),
      tap((action) => {
        this.authenticationService.loginUserSuccess(action.response);
      }),
      switchMap((_action) => [
        new friendActions.GetFriendsRequestAction({
          limit: null
        }),
        new userActions.GetUserMetadataRequestAction({})
      ])
    )
  );

  deleteUserRequestEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<userActions.DeleteRequestAction>(
        userActions.ActionTypes.DELETE_REQUEST
      ),
      switchMap((action) =>
        this.userService.deleteUser(action).pipe(
          map((response) => {
            return new userActions.DeleteSuccessAction(response);
          }),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new userActions.DeleteFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  deleteUserSuccessEffect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<userActions.DeleteSuccessAction>(
          userActions.ActionTypes.DELETE_SUCCESS
        ),
        tap((_response) => {
          this.userService.onDeleteUserSuccess();
        })
      ),
    { dispatch: false }
  );

  getUserRequestEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<userActions.GetUserRequestAction>(
        userActions.ActionTypes.GET_USER_REQUEST
      ),
      switchMap((_action) =>
        this.userService.getUser({}).pipe(
          tap((_response) => {
            this.userService.getUserRedirect();
          }),
          map((response) => new userActions.GetUserSuccessAction(response)),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new userActions.GetUserFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  getUserSuccessEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<userActions.GetUserSuccessAction>(
        userActions.ActionTypes.GET_USER_SUCCESS
      ),
      tap((_action) => {
        // none
      }),
      switchMap((_action) => [
        new friendActions.GetFriendsRequestAction({
          limit: null
        }),
        new userActions.GetUserMetadataRequestAction({})
      ])
    )
  );

  logoutUserEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<userActions.LogoutUserAction>(userActions.ActionTypes.LOGOUT_USER),
      tap((_action) => {
        this.authenticationService.logoutUserSuccess();
      }),
      switchMap((_action) => [
        new userActions.ResetStoreAction(),
        new spotActions.ResetStoreAction(),
        new commentActions.ResetStoreAction(),
        new socialActions.ResetStoreAction(),
        new chatActions.ResetStoreAction()
      ])
    )
  );

  // Metadata
  getUserMetadataRequestEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<userActions.GetUserMetadataRequestAction>(
        userActions.ActionTypes.GET_METADATA_REQUEST
      ),
      switchMap((action) =>
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
    )
  );

  updateUserMetadataRequestEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<userActions.UpdateUserMetadataRequestAction>(
        userActions.ActionTypes.UPDATE_METADATA_REQUEST
      ),
      switchMap((action) =>
        this.userService.updateUserMetadata(action.request).pipe(
          map((response) => {
            return new userActions.UpdateUserMetadataRequestSuccess(response);
          }),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new userActions.GenericFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );
}
