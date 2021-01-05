import { Component, OnInit, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Store
import { Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions, AccountsFacebookActions, AccountsGoogleActions } from '@store/accounts-store';

// Services
import { ModalService } from '@services/modal.service';
import { AuthenticationService } from '@services/authentication.service';

// Models
import { LoginRequest, RegisterRequest, FacebookLoginRequest, GoogleLoginRequest } from '@models/authentication';

// Assets
import { STRINGS } from '@assets/strings/en';

declare const gapi: any;

@Component({
  selector: 'spot-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit, OnDestroy, AfterViewInit {

  private readonly onDestroy = new Subject<void>();

  @Input() modalId: string;

  STRINGS = STRINGS.PRE_AUTH.AUTH_MODAL;

  selectedTab = 'login';

  loginForm: FormGroup;
  loginErrorMessage: string;
  registerForm: FormGroup;
  registerErrorMessage: string;

  errorMessage = '';

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: ModalService,
              private authenticationService: AuthenticationService,
              private fb: FormBuilder,
              private router: Router) {
    this.loginForm = this.fb.group({
      emailOrUsername: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.registerForm = this.fb.group({
      email: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['', Validators.required],
      terms: [false, Validators.required],
    });
  }

  ngOnInit() {

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

  close() {
    this.modalService.close(this.modalId);
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  login() {

    const val = this.loginForm.value;

    if (!val.emailOrUsername) {
      this.errorMessage = this.STRINGS.EMAIL_OR_USER_ERROR;
      this.loginForm.controls.emailOrUsername.markAsDirty();
      return;
    }

    if (!val.password) {
      this.errorMessage = this.STRINGS.PASSWORD_ERROR;
      this.loginForm.controls.password.markAsDirty();
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

  register() {
    const val = this.registerForm.value;
    let valid = true;

    if ( !val.terms ) {
      this.registerErrorMessage = this.STRINGS.TERMS_ERROR;
      this.registerForm.controls.terms.markAsDirty();
      return;
    }

    if (!val.email) {
      this.registerErrorMessage = this.STRINGS.EMAIL_ERROR;
      this.registerForm.controls.email.markAsDirty();
      return;
    }

    valid = this.authenticationService.validateEmail(val.email);
    if (!valid) {
      this.registerErrorMessage = this.STRINGS.EMAIL_INVALID;
      this.registerForm.controls.email.markAsDirty();
      return;
    }

    if (!val.username) {
      this.registerErrorMessage = this.STRINGS.USERNAME_ERROR;
      this.registerForm.controls.username.markAsDirty();
      return;
    }

    if (!val.password) {
      this.registerErrorMessage = this.STRINGS.PASSWORD_ERROR;
      this.registerForm.controls.password.markAsDirty();
      return;
    }

    if (!val.phone) {
      this.registerErrorMessage = this.STRINGS.PHONE_ERROR;
      this.registerForm.controls.phone.markAsDirty();
      return;
    }

    valid = this.authenticationService.validatePhone(val.phone);
    if (!valid) {
      this.registerErrorMessage = this.STRINGS.PHONE_INVALID;
      this.registerForm.controls.email.markAsDirty();
      return;
    }

    this.registerErrorMessage = '';

    const registerRequest: RegisterRequest = {
      email: val.email,
      username: val.username,
      password: this.authenticationService.md5Hash(val.password),
      phone: val.phone
    };

    this.store$.dispatch(
      new AccountsActions.RegisterRequestAction(registerRequest)
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
