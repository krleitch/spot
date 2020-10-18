import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as accountsActions from '@store/accounts-store/actions/actions';
import * as friendsActions from '@store/social-store/actions/friends.actions';
import * as postsActions from '@store/posts-store/actions';
import * as commentsActions from '@store/comments-store/actions';
import * as socialActions from '@store/social-store/actions/actions';
import { AuthenticationService } from '@services/authentication.service';
import { AccountsService } from '@services/accounts.service';
import { VerifyResponse } from '@models/accounts';
import { SpotError } from '@exceptions/error';
import { GetAccountMetadataSuccess } from '@models/accounts';

@Injectable()
export class AccountsStoreEffects {
  constructor(
    private authenticationService: AuthenticationService,
    private accountsService: AccountsService,
    private actions$: Actions
  ) { }

  @Effect({dispatch: false})
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.GenericFailureAction>(
      accountsActions.ActionTypes.GENERIC_FAILURE
    ),
    tap((action: accountsActions.GenericFailureAction) => {
      this.accountsService.failureMessage(action.error);
    })
  );


  @Effect()
  registerAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.RegisterRequestAction>(
      accountsActions.ActionTypes.REGISTER_REQUEST
    ),
    switchMap((registerRequest: accountsActions.RegisterRequestAction) =>
      this.authenticationService
        .registerAccount(registerRequest.request)
        .pipe(
          map( (response) =>
            new accountsActions.RegisterSuccessAction(response)
          ),
          catchError((errorResponse: any) =>
            observableOf(new accountsActions.RegisterFailureAction(errorResponse.error))
          )
        )
    )
  );

  @Effect()
  registerAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.RegisterSuccessAction>(
      accountsActions.ActionTypes.REGISTER_SUCCESS
    ),
    tap( (action: accountsActions.RegisterSuccessAction) => {
      this.authenticationService.registerAccountSuccess(action.response);
    }),
    switchMap ( (action: accountsActions.RegisterSuccessAction) => [
      new friendsActions.GetFriendsAction({ date: new Date().toString(), limit: null }),
      new accountsActions.GetAccountMetadataRequestAction({})
    ])
  );

  @Effect()
  loginAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.LoginRequestAction>(
      accountsActions.ActionTypes.LOGIN_REQUEST
    ),
    switchMap(authenticateRequest =>
      this.authenticationService
        .loginAccount(authenticateRequest.request)
        .pipe(
          map( (response) =>
            new accountsActions.LoginSuccessAction(response)
          ),
          catchError(errorResponse =>
            observableOf(new accountsActions.LoginFailureAction(errorResponse.error))
          )
        )
    )
  );

  @Effect()
  loginAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.LoginSuccessAction>(
      accountsActions.ActionTypes.LOGIN_SUCCESS
    ),
    tap((action: accountsActions.LoginSuccessAction) => {
      this.authenticationService.loginAccountSuccess(action.response);
    }),
    switchMap ( (action: accountsActions.LoginSuccessAction) => [
      new friendsActions.GetFriendsAction({ date: new Date().toString(), limit: null }),
      new accountsActions.GetAccountMetadataRequestAction({})
    ])
  );

  @Effect()
  logoutAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.LogoutRequestAction>(
      accountsActions.ActionTypes.LOGOUT_REQUEST
    ),
    tap((logoutRequest: accountsActions.LogoutRequestAction) => {
      this.authenticationService.logoutAccountSuccess();
    }),
    switchMap( (action: accountsActions.LogoutRequestAction ) => [
      new accountsActions.ResetStoreAction(),
      new postsActions.ResetStoreAction(),
      new commentsActions.ResetStoreAction(),
      new socialActions.ResetStoreAction(),
    ]),
  );

  @Effect()
  deleteAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.DeleteRequestAction>(
      accountsActions.ActionTypes.DELETE_REQUEST
    ),
    switchMap(deleteRequest =>
      this.accountsService
        .deleteAccount()
        .pipe(
            map(response => {
              return new accountsActions.DeleteSuccessAction();
            }),
            catchError(error =>
              observableOf(new accountsActions.DeleteFailureAction(error))
            )
          )
    )
  );

  @Effect({dispatch: false})
  deleteAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.DeleteSuccessAction>(
      accountsActions.ActionTypes.DELETE_SUCCESS
    ),
    tap( deleteRequest => {
      this.accountsService.onDeleteAccountSuccess();
    })
  );

  @Effect()
  getAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.AccountRequestAction>(
      accountsActions.ActionTypes.ACCOUNT_REQUEST
    ),
    switchMap(action =>
      this.accountsService
        .getAccount()
        .pipe(
            tap(response => {
              this.accountsService.getAccountRedirect();
            }),
            map( (response) =>
              new accountsActions.AccountSuccessAction(response)
            ),
            catchError(error =>
              observableOf(new accountsActions.AccountFailureAction(error))
            )
          )
    )
  );

  @Effect()
  getAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.AccountSuccessAction>(
      accountsActions.ActionTypes.ACCOUNT_SUCCESS
    ),
    tap((action: accountsActions.AccountSuccessAction) => {
      // none
    }),
    switchMap ( (action: accountsActions.AccountSuccessAction) => [
      new friendsActions.GetFriendsAction({ date: new Date().toString(), limit: null }),
      new accountsActions.GetAccountMetadataRequestAction({})
    ])
  );

  @Effect()
  updateAccountMetadataEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.UpdateAccountMetadataRequestAction>(
      accountsActions.ActionTypes.UPDATE_METADATA_REQUEST
    ),
    switchMap(action =>
      this.accountsService
        .updateAccountMetadata(action.request)
        .pipe(
            map(response => {
              return new accountsActions.UpdateAccountMetadataRequestSuccess(response)
            }),
            catchError(error =>
              observableOf(new accountsActions.GenericFailureAction(error))
            )
          )
    )
  );

  @Effect()
  getAccountMetadataEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.GetAccountMetadataRequestAction>(
      accountsActions.ActionTypes.GET_METADATA_REQUEST
    ),
    switchMap( (action: accountsActions.GetAccountMetadataRequestAction) =>
      this.accountsService
        .getAccountMetadata(action.request)
        .pipe(
            map( (response: GetAccountMetadataSuccess)  => {
              return new accountsActions.GetAccountMetadataRequestSuccess(response);
            }),
            catchError( (errorResponse: { error: SpotError }) =>
              observableOf(new accountsActions.GetAccountMetadataFailureAction(errorResponse.error))
            )
          )
    )
  );

  @Effect()
  verifyAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<accountsActions.VerifyRequestAction>(
      accountsActions.ActionTypes.VERIFY_REQUEST
    ),
    switchMap(action =>
      this.accountsService
        .verifyAccount(action.request)
        .pipe(
            map( (response: VerifyResponse) => new accountsActions.VerifySuccessAction(response)),
            catchError(errorResponse =>
              observableOf(new accountsActions.GenericFailureAction(errorResponse.error))
            )
          )
    )
  );

}
