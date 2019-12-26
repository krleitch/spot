import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as facebookActions from '../actions/facebook.action';
import { AuthenticationService } from '@services/auth.service';

@Injectable()
export class FacebookStoreEffects {
  constructor(private authenticationService: AuthenticationService, private actions$: Actions) { }

  @Effect()
  registerFacebookAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookRegisterRequestAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_REGISTER_REQUEST
    ),
    switchMap(loginRequest =>
      this.authenticationService
        .registerFacebookAccount(loginRequest.request)
        .pipe(
            map(response => new facebookActions.FacebookRegisterSuccessAction(response)),
            catchError(error =>
              observableOf(new facebookActions.FacebookRegisterFailureAction(error))
            )
        )
    )
  );

  @Effect({dispatch: false})
  registerFacebookAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookRegisterSuccessAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_REGISTER_SUCCESS
    ),
    tap( response => {
      this.authenticationService.registerFacebookAccountSuccess(response);
    })
  );

  @Effect()
  loginFacebookAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookLoginRequestAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_LOGIN_REQUEST
    ),
    switchMap(loginRequest =>
      this.authenticationService
        .loginFacebookAccount(loginRequest.request)
        .pipe(
            map(response => new facebookActions.FacebookLoginSuccessAction(response)),
            catchError(error =>
              observableOf(new facebookActions.FacebookLoginFailureAction(error))
            )
        )
    )
  );

  @Effect({dispatch: false})
  loginFacebookAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookLoginSuccessAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_LOGIN_SUCCESS
    ),
    tap( response => {
      this.authenticationService.loginFacebookAccountSuccess(response);
    })
  );

}
