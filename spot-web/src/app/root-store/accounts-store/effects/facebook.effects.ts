import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as facebookActions from '../actions/facebook.action';
import { AuthenticationService } from '@services/authentication.service';
import { FacebookLoginResponse } from '@models/authentication';

@Injectable()
export class FacebookStoreEffects {
  constructor(private authenticationService: AuthenticationService, private actions$: Actions) { }

  @Effect()
  loginFacebookAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<facebookActions.FacebookLoginRequestAction>(
      facebookActions.FacebookActionTypes.FACEBOOK_LOGIN_REQUEST
    ),
    switchMap(loginRequest =>
      this.authenticationService
        .loginFacebookAccount(loginRequest.request)
        .pipe(
            map( (response: FacebookLoginResponse) => new facebookActions.FacebookLoginSuccessAction(response)),
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
    tap( (action: facebookActions.FacebookLoginSuccessAction) => {
      this.authenticationService.loginFacebookAccountSuccess(action.response);
    })
  );

}
