import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as featureActions from '../actions/actions';
import { AuthenticationService } from '@services/authentication.service';

@Injectable()
export class AccountsStoreEffects {
  constructor(private authenticationService: AuthenticationService, private actions$: Actions) { }

  @Effect()
  authenticateAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AuthenticateRequestAction>(
      featureActions.ActionTypes.LOGIN_REQUEST
    ),
    switchMap(authenticateRequest =>
      this.authenticationService
        .loginAccount(authenticateRequest.request)
        .pipe(
            map(response => new featureActions.AuthenticateSuccessAction({ response })),
            catchError(error =>
              observableOf(new featureActions.AuthenticateFailureAction({ error }))
            )
          )
    )
  );

  @Effect()
  registerAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.RegisterRequestAction>(
      featureActions.ActionTypes.REGISTER_REQUEST
    ),
    switchMap(registerRequest =>
      this.authenticationService
        .registerAccount(registerRequest.request)
        .pipe(
            map(response => new featureActions.RegisterSuccessAction({ response })),
            catchError(error =>
              observableOf(new featureActions.RegisterFailureAction({ error }))
            )
          )
    )
  );

  @Effect({dispatch: false})
  logoutAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.LogoutRequestAction>(
      featureActions.ActionTypes.LOGOUT_REQUEST
    ),
    tap( logoutRequest => {
      this.authenticationService.logoutAccountSuccess();
    })
  );

  @Effect({dispatch: false})
  registerAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.RegisterSuccessAction>(
      featureActions.ActionTypes.REGISTER_SUCCESS
    ),
    tap( registerRequest => {
      this.authenticationService.registerAccountSuccess();
    })
  );

  @Effect({dispatch: false})
  authenticateAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AuthenticateSuccessAction>(
      featureActions.ActionTypes.LOGIN_SUCCESS
    ),
    tap( authenticateRequest => {
      this.authenticationService.loginAccountSuccess(authenticateRequest);
    })
  );

  @Effect({dispatch: false})
  deleteAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteSuccessAction>(
      featureActions.ActionTypes.DELETE_SUCCESS
    ),
    tap( deleteRequest => {
      this.authenticationService.onDeleteAccountSuccess();
    })
  );

  @Effect()
  deleteAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteRequestAction>(
      featureActions.ActionTypes.DELETE_REQUEST
    ),
    switchMap(deleteRequest =>
      this.authenticationService
        .deleteAccount()
        .pipe(
            map(response => new featureActions.DeleteSuccessAction()),
            catchError(error =>
              observableOf(new featureActions.DeleteFailureAction({ error }))
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
      this.authenticationService
        .getAccount()
        .pipe(
            map(response => new featureActions.AccountSuccessAction({ response })),
            catchError(error =>
              observableOf(new featureActions.AccountFailureAction({ error }))
            )
          )
    )
  );

}
