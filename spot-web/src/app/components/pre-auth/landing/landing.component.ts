import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { STRINGS } from '@assets/strings/en';
import { AuthenticationService } from '@services/authentication.service';
import { RegisterRequest } from '@models/authentication';
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions, AccountsFacebookActions, AccountsStoreSelectors } from '@store/accounts-store';
import { FacebookLoginRequest } from '@models/authentication';
import { SpotError } from '@exceptions/error';

@Component({
  selector: 'spot-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  STRINGS = STRINGS.PRE_AUTH.LANDING;

  form: FormGroup;
  authError$: Observable<SpotError>;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private store$: Store<RootStoreState.State>
  ) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  ngOnInit() {

    this.authError$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAuthenticationError)
    );

    this.authError$.pipe(takeUntil(this.onDestroy)).subscribe( (authError: SpotError) => {
      if ( authError ) {
        this.errorMessage = authError.message;
      }
    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  facebookLogin() {

    window['FB'].getLoginStatus((statusResponse) => {
      if (statusResponse.status !== 'connected') {
          window['FB'].login((loginResponse) => {
            if (loginResponse.status === 'connected') {

                // localStorage.removeItem('fb_access_token');
                // localStorage.removeItem('fb_expires_in');

                const request: FacebookLoginRequest = {
                  accessToken: loginResponse.authResponse.accessToken
                };

                this.store$.dispatch(
                  new AccountsFacebookActions.FacebookLoginRequestAction(request)
                );

            } else {
              // could not login
              // TODO some error msg
            }
          })
      } else {
        // already logged in
        this.router.navigateByUrl('/home');
        // window['FB'].logout();
      }
    });

  }

  googleLogin() {
    console.log('googleLogin');
  }

  signUp() {

    const val = this.form.value;

    if (!val.email) {
      this.errorMessage = this.STRINGS.EMAIL_ERROR;
      this.form.controls.email.markAsDirty();
      return;
    }

    const validEmail = this.authenticationService.validateEmail(val.email);
    if (!validEmail) {
      this.errorMessage = this.STRINGS.EMAIL_INVALID;
      this.form.controls.email.markAsDirty();
      return;
    }

    if (!val.username) {
      this.errorMessage = this.STRINGS.USERNAME_ERROR;
      this.form.controls.username.markAsDirty();
      return;
    }

    const validUsername = this.authenticationService.validateUsername(val.username);
    if (validUsername !== null) {
      this.errorMessage = validUsername;
      this.form.controls.username.markAsDirty();
      return;
    }

    if (!val.password) {
      this.errorMessage = this.STRINGS.PASSWORD_ERROR;
      this.form.controls.password.markAsDirty();
      return;
    }

    const validPassword = this.authenticationService.validatePassword(val.password);
    if (validPassword !== null) {
      this.errorMessage = validPassword;
      this.form.controls.password.markAsDirty();
      return;
    }

    if (!val.phone) {
      this.errorMessage = this.STRINGS.PHONE_ERROR;
      this.form.controls.phone.markAsDirty();
      return;
    }

    const validPhone = this.authenticationService.validatePhone(val.phone);
    if (!validPhone) {
      this.errorMessage = this.STRINGS.PHONE_INVALID;
      this.form.controls.email.markAsDirty();
      return;
    }

    this.errorMessage = '';

    const registerRequest: RegisterRequest = {
      email: val.email,
      username: val.username,
      password: val.password,
      phone: val.phone
    };

    this.store$.dispatch(
      new AccountsActions.RegisterRequestAction(registerRequest)
    );

  }

  signIn() {
    this.router.navigateByUrl('/login');
  }

}
