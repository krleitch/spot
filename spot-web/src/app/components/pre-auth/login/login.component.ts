import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// rxjs
import { Observable, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

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
import { AuthenticationService } from '@services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

// Assets
import { SpotError } from '@exceptions/error';
import {
  FacebookLoginRequest,
  GoogleLoginRequest,
  LoginRequest
} from '@models/authentication';

declare const gapi: any;

@Component({
  selector: 'spot-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  STRINGS;

  form: FormGroup;
  authenticationError$: Observable<SpotError>;
  isAuthenticated$: Observable<boolean>;
  errorMessage: string;
  buttonsDisabled = false;
  facebookLoaded = false;

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private store$: Store<RootStoreState.State>,
    private translateService: TranslateService
  ) {
    this.form = this.fb.group({
      emailOrUsername: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.translateService.get('PRE_AUTH.LOGIN').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    // SUCCESS
    this.isAuthenticated$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsAuthenticated)
    );

    this.isAuthenticated$
      .pipe(takeUntil(this.onDestroy), skip(1))
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
            this.errorMessage = this.STRINGS.RATE_LIMIT.replace(
              '%TIMEOUT%',
              authenticationError.body.timeout
            );
          } else {
            this.errorMessage = authenticationError.message;
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

  signIn(): void {
    if (this.buttonsDisabled) {
      return;
    }

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
      password: val.password
    };

    this.store$.dispatch(new UserActions.LoginRequestAction(loginRequest));

    this.buttonsDisabled = true;
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
}
