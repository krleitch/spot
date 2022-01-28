import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  AccountsActions,
  AccountsFacebookActions,
  AccountsGoogleActions,
  AccountsStoreSelectors
} from '@store/accounts-store';

// Services
import { AuthenticationService } from '@services/authentication.service';
import { ModalService } from '@services/modal.service';

// Models
import {
  FacebookLoginRequest,
  GoogleLoginRequest
} from '@models/authentication';
import { SpotError } from '@exceptions/error';
import { RegisterRequest } from '@models/authentication';

// Assets
import { STRINGS } from '@assets/strings/en';

// google api
declare const gapi: any;

@Component({
  selector: 'spot-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  STRINGS = STRINGS.PRE_AUTH.LANDING;

  form: FormGroup;
  authenticationError$: Observable<SpotError>;
  authenticationSuccess$: Observable<boolean>;
  errorMessage: string;
  buttonsDisabled = false;
  facebookLoaded = false;

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private modalService: ModalService,
    private store$: Store<RootStoreState.State>
  ) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['', Validators.required],
      terms: [false, Validators.required]
    });
  }

  ngOnInit(): void {
    // FAILURE
    this.authenticationError$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAuthenticationError)
    );

    this.authenticationError$
      .pipe(takeUntil(this.onDestroy), skip(1))
      .subscribe((authenticationError: SpotError) => {
        if (authenticationError) {
          if (authenticationError.name === 'RateLimitError') {
            this.errorMessage = this.STRINGS.RATE_LIMIT.replace(
              '%TIMEOUT%',
              authenticationError.body.timeout
            );
          } else {
            this.errorMessage = authenticationError.message;
          }
        }
        this.buttonsDisabled = false;
      });

    // SUCCESS
    this.authenticationSuccess$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAuthenticationSuccess)
    );

    this.authenticationSuccess$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((authenticationSuccess: boolean) => {
        if (authenticationSuccess) {
          this.buttonsDisabled = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  ngAfterViewInit(): void {
    this.authenticationService.socialServiceReady
      .pipe(takeUntil(this.onDestroy))
      .subscribe((service: string) => {
        if (service === 'google') {
          gapi.signin2.render('my-signin2', {
            scope: 'profile email',
            width: 240,
            height: 55,
            longtitle: true,
            theme: 'light',
            onsuccess: (param) => this.googleLogin(param)
          });
        }
        if (service === 'FB') {
          setTimeout(() => {
            this.facebookLoaded = true;
          });
        }
      });
  }

  facebookLogin(): void {
    if (this.buttonsDisabled) {
      return;
    }

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
            this.buttonsDisabled = true;
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
        this.buttonsDisabled = true;
      }
    });
  }

  googleLogin(googleUser): void {
    if (this.buttonsDisabled) {
      return;
    }

    // profile.getId(), getName(), getImageUrl(), getEmail()
    // const profile = googleUser.getBasicProfile();

    const id_token = googleUser.getAuthResponse().id_token;

    const request: GoogleLoginRequest = {
      accessToken: id_token
    };

    this.store$.dispatch(
      new AccountsGoogleActions.GoogleLoginRequestAction(request)
    );
    this.buttonsDisabled = true;

    // sign out of the instance, so we don't auto login
    this.googleSignOut();
  }

  googleSignOut(): void {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {});
  }

  signUp(): void {
    if (this.buttonsDisabled) {
      return;
    }

    const val = this.form.value;

    if (!val.terms) {
      this.errorMessage = this.STRINGS.TERMS_ERROR;
      this.form.controls.terms.markAsDirty();
      return;
    }

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

    const validUsername = this.authenticationService.validateUsername(
      val.username
    );
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

    const validPassword = this.authenticationService.validatePassword(
      val.password
    );
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
    this.buttonsDisabled = true;
  }

  openTerms(): void {
    this.modalService.open('spot-terms-modal');
  }
}
