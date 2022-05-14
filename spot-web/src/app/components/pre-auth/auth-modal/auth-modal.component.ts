import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable, Subject } from 'rxjs';
import { skip, takeUntil, take } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  UserActions,
  UserFacebookActions,
  UserGoogleActions,
  UserStoreSelectors
} from '@src/app/root-store/user-store';

// Services
import { ModalService } from '@services/modal.service';
import { AuthenticationService } from '@services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

// Models
import {
  FacebookLoginRequest,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
  RegisterResponse
} from '@models/authentication';
import { SetUserStore } from '@models/user';
import { SpotError } from '@exceptions/error';

declare const gapi: any;

@Component({
  selector: 'spot-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  // MODAL
  modalId: string;
  data; // unused

  STRINGS;

  selectedTab = 'login';

  authenticationError$: Observable<SpotError>;
  isAuthenticated$: Observable<boolean>;
  loginForm: FormGroup;
  loginErrorMessage: string;
  registerForm: FormGroup;
  registerErrorMessage: string;
  buttonsDisabled: boolean;
  facebookLoaded = false;

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: ModalService,
    private authenticationService: AuthenticationService,
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {
    this.loginForm = this.fb.group({
      emailOrUsername: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.registerForm = this.fb.group({
      email: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['', Validators.required],
      terms: [false, Validators.required]
    });
    this.translateService.get('PRE_AUTH.AUTH_MODAL').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    // SUCCESS
    this.isAuthenticated$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsAuthenticated)
    );

    this.isAuthenticated$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((isAuthenticated: boolean) => {
        if (isAuthenticated) {
          this.buttonsDisabled = false;
        }
      });

    // FAILURE
    this.authenticationError$ = this.store$.pipe(
      select(UserStoreSelectors.selectAuthenticationError)
    );

    this.authenticationError$
      .pipe(takeUntil(this.onDestroy), skip(1))
      .subscribe((authenticationError: SpotError) => {
        if (authenticationError) {
          if (authenticationError.name === 'RateLimitError') {
            this.loginErrorMessage = this.STRINGS.RATE_LIMIT.replace(
              '%LIMIT%',
              authenticationError.body.limit
            ).replace('%TIMEOUT%', authenticationError.body.timeout);
            this.registerErrorMessage = this.STRINGS.RATE_LIMIT.replace(
              '%LIMIT%',
              authenticationError.body.limit
            ).replace('%TIMEOUT%', authenticationError.body.timeout);
          } else {
            this.loginErrorMessage = authenticationError.message;
            this.registerErrorMessage = authenticationError.message;
          }
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

  close(): void {
    this.modalService.close(this.modalId);
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
    this.loginErrorMessage = '';
    this.registerErrorMessage = '';
    this.loginForm.markAsPristine();
    this.registerForm.markAsPristine();
  }

  login(): void {
    if (this.buttonsDisabled) {
      return;
    }

    const val = this.loginForm.value;

    if (!val.emailOrUsername) {
      this.loginErrorMessage = this.STRINGS.EMAIL_OR_USER_ERROR;
      this.loginForm.controls.emailOrUsername.markAsDirty();
      return;
    }

    if (!val.password) {
      this.loginErrorMessage = this.STRINGS.PASSWORD_ERROR;
      this.loginForm.controls.password.markAsDirty();
      return;
    }

    this.loginErrorMessage = '';

    const loginRequest: LoginRequest = {
      emailOrUsername: val.emailOrUsername,
      password: val.password
    };

    this.store$.dispatch(new UserActions.LoginRequestAction(loginRequest));
  }

  register(): void {
    if (this.buttonsDisabled) {
      return;
    }

    const val = this.registerForm.value;
    let valid = true;

    if (!val.terms) {
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

    const registerRequest: RegisterRequest = {
      email: val.email,
      username: val.username,
      password: this.authenticationService.md5Hash(val.password),
      phone: val.phone
    };

    this.registerErrorMessage = '';
    this.buttonsDisabled = true;
    this.authenticationService
      .registerUser(registerRequest)
      .pipe(take(1))
      .subscribe(
        (response: RegisterResponse) => {
          const setUserStore: SetUserStore = {
            user: response.user
          };
          response
          this.store$.dispatch(new UserActions.SetUserAction(setUserStore));
          this.buttonsDisabled = false;
        },

        (err: { error: SpotError }) => {
          // Displays the servers erorr message
          // Errors are kept to validation and generic
          this.registerErrorMessage = err.error.message;
          this.buttonsDisabled = false;
        }
      );
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
              new UserFacebookActions.FacebookLoginRequestAction(request)
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
          new UserFacebookActions.FacebookLoginRequestAction(request)
        );
        this.buttonsDisabled = true;
      }
    });
  }

  googleLogin(googleUser): void {
    // profile.getId(), getName(), getImageUrl(), getEmail()
    // const profile = googleUser.getBasicProfile();

    if (this.buttonsDisabled) {
      return;
    }

    const id_token = googleUser.getAuthResponse().id_token;

    const request: GoogleLoginRequest = {
      accessToken: id_token
    };

    this.store$.dispatch(
      new UserGoogleActions.GoogleLoginRequestAction(request)
    );
    this.buttonsDisabled = true;

    // sign out of the instance, so we don't auto login
    this.googleSignOut();
  }

  googleSignOut(): void {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {});
  }

  openTerms(): void {
    this.modalService.open('global', 'terms');
  }
}
