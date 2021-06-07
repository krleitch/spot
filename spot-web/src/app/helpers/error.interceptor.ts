import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';

// rxjs
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// services
import { AuthenticationService } from '@services/authentication.service';

// store
import { Store } from '@ngrx/store';
import { AccountsActions } from '@store/accounts-store';
import { RootStoreState } from '@store';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService,
                private store$: Store<RootStoreState.State>) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError( (err: any) => {

            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.store$.dispatch(
                  new AccountsActions.LogoutRequestAction()
                );
            }

            return throwError(err);

        }));
    }
}
