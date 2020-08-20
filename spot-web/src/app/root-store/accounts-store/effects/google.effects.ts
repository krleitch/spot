import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as googleActions from '../actions/google.actions';
import { AuthenticationService } from '@services/authentication.service';
import { GoogleLoginResponse } from '@models/authentication';

@Injectable()
export class GoogleStoreEffects {
  constructor(private authenticationService: AuthenticationService,
              private actions$: Actions) { }

  @Effect()
  loginGoogleAccountEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleLoginRequestAction>(
      googleActions.GoogleActionTypes.GOOGLE_LOGIN_REQUEST
    ),
    switchMap(action =>
      this.authenticationService
        .loginGoogleAccount(action.request)
        .pipe(
            map( (response: GoogleLoginResponse) => new googleActions.GoogleLoginSuccessAction(response)),
            catchError(error =>
              observableOf(new googleActions.GoogleLoginFailureAction(error))
            )
        )
    )
  );

  @Effect({dispatch: false})
  loginGoogleAccountSuccessEffect$: Observable<Action> = this.actions$.pipe(
    ofType<googleActions.GoogleLoginSuccessAction>(
      googleActions.GoogleActionTypes.GOOGLE_LOGIN_SUCCESS
    ),
    tap( (action: googleActions.GoogleLoginSuccessAction) => {
      this.authenticationService.loginGoogleAccountSuccess(action.response);
    })
  );

}
