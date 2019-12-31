import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as featureActions from '../actions/actions';
import { AuthenticationService } from '@services/authentication.service';
import { AccountsService } from '@services/accounts.service';
import { RegisterResponse, LoginResponse } from '@models/authentication';

@Injectable()
export class AccountsStoreEffects {
  constructor(
    private authenticationService: AuthenticationService,
    private accountsService: AccountsService,
    private actions$: Actions
  ) { }

  @Effect()
  registerAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.RegisterRequestAction>(
      featureActions.ActionTypes.REGISTER_REQUEST
    ),
    switchMap((registerRequest: featureActions.RegisterRequestAction) =>
      this.authenticationService
        .registerAccount(registerRequest.request)
        .pipe(
          map((response: RegisterResponse) => {
            console.log(response);
            return new featureActions.RegisterSuccessAction(response);
          }),
          catchError((error: any) =>
            observableOf(new featureActions.RegisterFailureAction(error))
          )
        )
    )
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
            map(response => new featureActions.LoginSuccessAction(response)),
            catchError(error =>
              observableOf(new featureActions.LoginFailureAction(error))
            )
          )
    )
  );

  @Effect({dispatch: false})
  logoutAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LogoutRequestAction>(
      featureActions.ActionTypes.LOGOUT_REQUEST
    ),
    tap( (logoutRequest) => {
      this.authenticationService.logoutAccountSuccess();
    })
  );

  @Effect({dispatch: false})
  registerAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.RegisterSuccessAction>(
      featureActions.ActionTypes.REGISTER_SUCCESS
    ),
    tap( registerResponse => {
      this.authenticationService.loginAccountSuccess(registerResponse);
    })
  );

  @Effect({dispatch: false})
  loginAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LoginSuccessAction>(
      featureActions.ActionTypes.LOGIN_SUCCESS
    ),
    tap( loginResponse => {
      this.authenticationService.loginAccountSuccess(loginResponse);
    })
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
  deleteAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteRequestAction>(
      featureActions.ActionTypes.DELETE_REQUEST
    ),
    switchMap(deleteRequest =>
      this.accountsService
        .deleteAccount()
        .pipe(
            map(response => new featureActions.DeleteSuccessAction()),
            catchError(error =>
              observableOf(new featureActions.DeleteFailureAction(error))
            )
          )
    )
  );

  @Effect()
  getAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AccountRequestAction>(
      featureActions.ActionTypes.ACCOUNT_REQUEST
    ),
    switchMap(deleteRequest =>
      this.accountsService
        .getAccount()
        .pipe(
            map(response => new featureActions.AccountSuccessAction(response)),
            catchError(error =>
              observableOf(new featureActions.AccountFailureAction(error))
            )
          )
    )
  );

}
