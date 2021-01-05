import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { STRINGS } from '@assets/strings/en';
import { AuthenticationService } from '@services/authentication.service';
import { LoginRequest, FacebookLoginRequest, GoogleLoginRequest } from '@models/authentication';
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions, AccountsStoreSelectors, AccountsGoogleActions, AccountsFacebookActions } from '@store/accounts-store';
import { SpotError } from '@exceptions/error';

declare const gapi: any;

@Component({
  selector: 'spot-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {

  private readonly onDestroy = new Subject<void>();

  STRINGS = STRINGS.PRE_AUTH.LOGIN;

  form: FormGroup;
  authError$: Observable<SpotError>;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private store$: Store<RootStoreState.State>) {

    this.form = this.fb.group({
      emailOrUsername: ['', Validators.required],
      password: ['', Validators.required],
    });

  }

  ngOnInit() {

    this.authError$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAuthenticationError)
    );

    this.authError$.pipe(takeUntil(this.onDestroy)).subscribe( (authError: SpotError) => {
      if ( authError ) {

        if ( authError.name === 'RateLimitError') {
          this.errorMessage = this.STRINGS.RATE_LIMIT.replace('%LIMIT%', authError.body.limit)
                                                     .replace('%TIMEOUT%', authError.body.timeout);
        } else {
          this.errorMessage = authError.message;
        }

      }
    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  ngAfterViewInit() {
    this.authenticationService.socialServiceReady.pipe(takeUntil(this.onDestroy)).subscribe((service: string) => {
      if ( service === 'google' ) {
        gapi.signin2.render('my-signin2', {
            scope: 'profile email',
            width: 240,
            height: 55,
            longtitle: true,
            theme: 'light',
            onsuccess: param => this.googleLogin(param)
        });
      }
    });
  }

  signIn() {

    const val = this.form.value;

    if (!val.emailOrUsername) {
      this.errorMessage = this.STRINGS.EMAIL_OR_USER_ERROR;
      this.form.controls.emailOrUsername.markAsDirty();
      return;
    }

    if (!val.password) {
      this.errorMessage = this.STRINGS.PASSWORD_ERROR;
      this.form.controls.password.markAsDirty();
      return;
    }

    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      emailOrUsername: val.emailOrUsername,
      password: val.password,
    };
    this.store$.dispatch(
      new AccountsActions.LoginRequestAction(loginRequest)
    );

  }

  facebookLogin() {

    window['FB'].getLoginStatus((statusResponse) => {
      if (statusResponse.status !== 'connected') {
          window['FB'].login((loginResponse) => {
            if (loginResponse.status === 'connected') {

                const request: FacebookLoginRequest = {
                  accessToken: loginResponse.authResponse.accessToken
                };

                this.store$.dispatch(
                  new AccountsFacebookActions.FacebookLoginRequestAction(request)
                );

            }
          });
      } else {
        // already logged in
        const request: FacebookLoginRequest = {
          accessToken: statusResponse.authResponse.accessToken
        };

        this.store$.dispatch(
          new AccountsFacebookActions.FacebookLoginRequestAction(request)
        );
      }
    });

  }

  googleLogin(googleUser) {

    // profile.getId(), getName(), getImageUrl(), getEmail()
    // const profile = googleUser.getBasicProfile();

    const id_token = googleUser.getAuthResponse().id_token;

    const request: GoogleLoginRequest = {
      accessToken: id_token
    };

    this.store$.dispatch(
      new AccountsGoogleActions.GoogleLoginRequestAction(request)
    );

    // sign out of the instance, so we don't auto login
    this.googleSignOut();

  }

  googleSignOut() {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {

    });
  }

}
