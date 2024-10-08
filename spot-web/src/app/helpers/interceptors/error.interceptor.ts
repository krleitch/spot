import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';

// rxjs
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// services
import { AuthenticationService } from '@services/authentication.service';

// store
import { Store } from '@ngrx/store';
import { UserActions } from '@src/app/root-store/user-store';
import { RootStoreState } from '@store';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthenticationService,
    private store$: Store<RootStoreState.State>
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (
          err.status === 401 &&
          !request.url.includes('http://localhost:4000')
        ) {
          // TODO: fix, do not logout if error is from chat service
          // auto logout if 401 response returned from api
          this.store$.dispatch(new UserActions.LogoutUserAction());
        }

        return throwError(err);
      })
    );
  }
}
