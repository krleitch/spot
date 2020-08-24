import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as featureActions from '../actions/actions';
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
    ofType<featureActions.GenericFailureAction>(
      featureActions.ActionTypes.GENERIC_FAILURE
    ),
    tap((action: featureActions.GenericFailureAction) => {
      this.accountsService.failureMessage(action.error);
    })
  );


  @Effect()
  registerAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.RegisterRequestAction>(
      featureActions.ActionTypes.REGISTER_REQUEST
    ),
    switchMap((registerRequest: featureActions.RegisterRequestAction) =>
      this.authenticationService
        .registerAccount(registerRequest.request)
        .pipe(
          map( (response) =>
            new featureActions.RegisterSuccessAction(response)
          ),
          catchError((errorResponse: any) =>
            observableOf(new featureActions.RegisterFailureAction(errorResponse.error))
          )
        )
    )
  );

  @Effect()
  registerAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.RegisterSuccessAction>(
      featureActions.ActionTypes.REGISTER_SUCCESS
    ),
    tap( (action: featureActions.RegisterSuccessAction) => {
      this.authenticationService.registerAccountSuccess(action.response);
    }),
    switchMap ( (action: featureActions.RegisterSuccessAction) => [
      new friendsActions.GetFriendsAction({ date: new Date().toString(), limit: null }),
      new featureActions.GetAccountMetadataRequestAction({})
    ])
  );

  @Effect()
  loginAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LoginRequestAction>(
      featureActions.ActionTypes.LOGIN_REQUEST
    ),
    switchMap(authenticateRequest =>
      this.authenticationService
        .loginAccount(authenticateRequest.request)
        .pipe(
          map( (response) =>
            new featureActions.LoginSuccessAction(response)
          ),
          catchError(errorResponse =>
            observableOf(new featureActions.LoginFailureAction(errorResponse.error))
          )
        )
    )
  );

  @Effect()
  loginAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LoginSuccessAction>(
      featureActions.ActionTypes.LOGIN_SUCCESS
    ),
    tap((action: featureActions.LoginSuccessAction) => {
      this.authenticationService.loginAccountSuccess(action.response);
    }),
    switchMap ( (action: featureActions.LoginSuccessAction) => [
      new friendsActions.GetFriendsAction({ date: new Date().toString(), limit: null }),
      new featureActions.GetAccountMetadataRequestAction({})
    ])
  );

  @Effect({dispatch: false})
  logoutAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LogoutRequestAction>(
      featureActions.ActionTypes.LOGOUT_REQUEST
    ),
    tap((logoutRequest: featureActions.LogoutRequestAction) => {
      this.authenticationService.logoutAccountSuccess();
    })
  );

  @Effect()
  deleteAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteRequestAction>(
      featureActions.ActionTypes.DELETE_REQUEST
    ),
    switchMap(deleteRequest =>
      this.accountsService
        .deleteAccount()
        .pipe(
            map(response => {
              return new featureActions.DeleteSuccessAction();
            }),
            catchError(error =>
              observableOf(new featureActions.DeleteFailureAction(error))
            )
          )
    )
  );

  @Effect({dispatch: false})
  deleteAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteSuccessAction>(
      featureActions.ActionTypes.DELETE_SUCCESS
    ),
    tap( deleteRequest => {
      this.accountsService.onDeleteAccountSuccess();
    })
  );

  @Effect()
  getAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AccountRequestAction>(
      featureActions.ActionTypes.ACCOUNT_REQUEST
    ),
    switchMap(action =>
      this.accountsService
        .getAccount()
        .pipe(
            tap(response => {
              this.accountsService.getAccountRedirect();
            }),
            map( (response) =>
              new featureActions.AccountSuccessAction(response)
            ),
            catchError(error =>
              observableOf(new featureActions.AccountFailureAction(error))
            )
          )
    )
  );

  @Effect()
  getAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AccountSuccessAction>(
      featureActions.ActionTypes.ACCOUNT_SUCCESS
    ),
    tap((action: featureActions.AccountSuccessAction) => {
      // none
    }),
    switchMap ( (action: featureActions.AccountSuccessAction) => [
      new friendsActions.GetFriendsAction({ date: new Date().toString(), limit: null }),
      new featureActions.GetAccountMetadataRequestAction({})
    ])
  );

  @Effect()
  updateAccountMetadataEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.UpdateAccountMetadataRequestAction>(
      featureActions.ActionTypes.UPDATE_METADATA_REQUEST
    ),
    switchMap(action =>
      this.accountsService
        .updateAccountMetadata(action.request)
        .pipe(
            map(response => {
              return new featureActions.UpdateAccountMetadataRequestSuccess(response)
            }),
            catchError(error =>
              observableOf(new featureActions.GenericFailureAction(error))
            )
          )
    )
  );

  @Effect()
  getAccountMetadataEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.GetAccountMetadataRequestAction>(
      featureActions.ActionTypes.GET_METADATA_REQUEST
    ),
    switchMap( (action: featureActions.GetAccountMetadataRequestAction) =>
      this.accountsService
        .getAccountMetadata(action.request)
        .pipe(
            map( (response: GetAccountMetadataSuccess)  => {
              return new featureActions.GetAccountMetadataRequestSuccess(response);
            }),
            catchError( (errorResponse: { error: SpotError }) =>
              observableOf(new featureActions.GetAccountMetadataFailureAction(errorResponse.error))
            )
          )
    )
  );

  @Effect()
  verifyAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.VerifyRequestAction>(
      featureActions.ActionTypes.VERIFY_REQUEST
    ),
    switchMap(action =>
      this.accountsService
        .verifyAccount(action.request)
        .pipe(
            map( (response: VerifyResponse) => new featureActions.VerifySuccessAction(response)),
            catchError(errorResponse =>
              observableOf(new featureActions.GenericFailureAction(errorResponse.error))
            )
          )
    )
  );

}
