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
  ) { }

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
              new userActions.UpdateUserMetadataRequestFailure(errorResponse.error)
            )
          )
        )
      )
    )
  );
}
