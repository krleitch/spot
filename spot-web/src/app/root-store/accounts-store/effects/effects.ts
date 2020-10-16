import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as AccountsActions from '../actions/actions';
import * as friendsActions from '../../social-store/actions/friends.actions';
import { AuthenticationService } from '@services/authentication.service';
import { AccountsService } from '@services/accounts.service';
import { RegisterResponse, LoginResponse } from '@models/authentication';
import { VerifyResponse, VerifyConfirmResponse } from '@models/accounts';
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
    ofType<AccountsActions.GenericFailureAction>(
      AccountsActions.ActionTypes.GENERIC_FAILURE
    ),
    tap((action: AccountsActions.GenericFailureAction) => {
      this.accountsService.failureMessage(action.error);
    })
  );


  @Effect()
  registerAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<AccountsActions.RegisterRequestAction>(
      AccountsActions.ActionTypes.REGISTER_REQUEST
    ),
    switchMap((registerRequest: AccountsActions.RegisterRequestAction) =>
      this.authenticationService
        .registerAccount(registerRequest.request)
        .pipe(
          map( (response) =>
            new AccountsActions.RegisterSuccessAction(response)
          ),
          catchError((errorResponse: any) =>
            observableOf(new AccountsActions.RegisterFailureAction(errorResponse.error))
          )
        )
    )
  );

  @Effect()
  registerAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<AccountsActions.RegisterSuccessAction>(
      AccountsActions.ActionTypes.REGISTER_SUCCESS
    ),
    tap( (action: AccountsActions.RegisterSuccessAction) => {
      this.authenticationService.registerAccountSuccess(action.response);
    }),
    switchMap ( (action: AccountsActions.RegisterSuccessAction) => [
      new friendsActions.GetFriendsAction({ date: new Date().toString(), limit: null }),
      new AccountsActions.GetAccountMetadataRequestAction({})
    ])
  );

  @Effect()
  loginAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<AccountsActions.LoginRequestAction>(
      AccountsActions.ActionTypes.LOGIN_REQUEST
    ),
    switchMap(authenticateRequest =>
      this.authenticationService
        .loginAccount(authenticateRequest.request)
        .pipe(
          map( (response) =>
            new AccountsActions.LoginSuccessAction(response)
          ),
          catchError(errorResponse =>
            observableOf(new AccountsActions.LoginFailureAction(errorResponse.error))
          )
        )
    )
  );

  @Effect()
  loginAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<AccountsActions.LoginSuccessAction>(
      AccountsActions.ActionTypes.LOGIN_SUCCESS
    ),
    tap((action: AccountsActions.LoginSuccessAction) => {
      this.authenticationService.loginAccountSuccess(action.response);
    }),
    switchMap ( (action: AccountsActions.LoginSuccessAction) => [
      new friendsActions.GetFriendsAction({ date: new Date().toString(), limit: null }),
      new AccountsActions.GetAccountMetadataRequestAction({})
    ])
  );

  @Effect()
  logoutAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<AccountsActions.LogoutRequestAction>(
      AccountsActions.ActionTypes.LOGOUT_REQUEST
    ),
    tap((logoutRequest: AccountsActions.LogoutRequestAction) => {
      this.authenticationService.logoutAccountSuccess();
    }),
    switchMap( (action: AccountsActions.LogoutRequestAction ) => [
      new AccountsActions.ResetStoreAction()
    ]),
  );

  @Effect()
  deleteAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<AccountsActions.DeleteRequestAction>(
      AccountsActions.ActionTypes.DELETE_REQUEST
    ),
    switchMap(deleteRequest =>
      this.accountsService
        .deleteAccount()
        .pipe(
            map(response => {
              return new AccountsActions.DeleteSuccessAction();
            }),
            catchError(error =>
              observableOf(new AccountsActions.DeleteFailureAction(error))
            )
          )
    )
  );

  @Effect({dispatch: false})
  deleteAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<AccountsActions.DeleteSuccessAction>(
      AccountsActions.ActionTypes.DELETE_SUCCESS
    ),
    tap( deleteRequest => {
      this.accountsService.onDeleteAccountSuccess();
    })
  );

  @Effect()
  getAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<AccountsActions.AccountRequestAction>(
      AccountsActions.ActionTypes.ACCOUNT_REQUEST
    ),
    switchMap(action =>
      this.accountsService
        .getAccount()
        .pipe(
            tap(response => {
              this.accountsService.getAccountRedirect();
            }),
            map( (response) =>
              new AccountsActions.AccountSuccessAction(response)
            ),
            catchError(error =>
              observableOf(new AccountsActions.AccountFailureAction(error))
            )
          )
    )
  );

  @Effect()
  getAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<AccountsActions.AccountSuccessAction>(
      AccountsActions.ActionTypes.ACCOUNT_SUCCESS
    ),
    tap((action: AccountsActions.AccountSuccessAction) => {
      // none
    }),
    switchMap ( (action: AccountsActions.AccountSuccessAction) => [
      new friendsActions.GetFriendsAction({ date: new Date().toString(), limit: null }),
      new AccountsActions.GetAccountMetadataRequestAction({})
    ])
  );

  @Effect()
  updateAccountMetadataEffect$: Observable<Action> = this.actions$.pipe(
    ofType<AccountsActions.UpdateAccountMetadataRequestAction>(
      AccountsActions.ActionTypes.UPDATE_METADATA_REQUEST
    ),
    switchMap(action =>
      this.accountsService
        .updateAccountMetadata(action.request)
        .pipe(
            map(response => {
              return new AccountsActions.UpdateAccountMetadataRequestSuccess(response)
            }),
            catchError(error =>
              observableOf(new AccountsActions.GenericFailureAction(error))
            )
          )
    )
  );

  @Effect()
  getAccountMetadataEffect$: Observable<Action> = this.actions$.pipe(
    ofType<AccountsActions.GetAccountMetadataRequestAction>(
      AccountsActions.ActionTypes.GET_METADATA_REQUEST
    ),
    switchMap( (action: AccountsActions.GetAccountMetadataRequestAction) =>
      this.accountsService
        .getAccountMetadata(action.request)
        .pipe(
            map( (response: GetAccountMetadataSuccess)  => {
              return new AccountsActions.GetAccountMetadataRequestSuccess(response);
            }),
            catchError( (errorResponse: { error: SpotError }) =>
              observableOf(new AccountsActions.GetAccountMetadataFailureAction(errorResponse.error))
            )
          )
    )
  );

  @Effect()
  verifyAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<AccountsActions.VerifyRequestAction>(
      AccountsActions.ActionTypes.VERIFY_REQUEST
    ),
    switchMap(action =>
      this.accountsService
        .verifyAccount(action.request)
        .pipe(
            map( (response: VerifyResponse) => new AccountsActions.VerifySuccessAction(response)),
            catchError(errorResponse =>
              observableOf(new AccountsActions.GenericFailureAction(errorResponse.error))
            )
          )
    )
  );

}
