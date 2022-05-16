import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

// rxjs
import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

// Store
import { Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  UserActions,
  UserFacebookActions
} from '@src/app/root-store/user-store';

// Services
import { AuthenticationService } from '@services/authentication.service';

// Assets
import { SpotError } from '@exceptions/error';
import {
  FacebookLoginRequest,
  LoginRequest,
  LoginResponse
} from '@models/authentication';
import { SetUserStore } from '@models/user';

// Validators
import { validateAllFormFields } from '@helpers/validators/validate-helpers';

@Component({
  selector: 'spot-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  STRINGS: Record<string, string>;

  loginForm: FormGroup;

  // State
  authenticationError$: Observable<SpotError>;
  isAuthenticated$: Observable<boolean>;
  errorMessage: string;
  loginLoading = false;
  facebookLoaded = false;

  constructor(
    private authenticationService: AuthenticationService,
    private store$: Store<RootStoreState.State>
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      emailOrUsername: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  ngAfterViewInit(): void {
    this.authenticationService.socialServiceReady
      .pipe(takeUntil(this.onDestroy))
      .subscribe((service) => {
        if (service === 'google') {
          window.google.accounts.id.renderButton(
            document.getElementById('googleButtonLogin'),
            { theme: 'outline', size: 'large' }
          );
        }
        if (service === 'FB') {
          setTimeout(() => {
            this.facebookLoaded = true;
          });
        }
      });
  }

  facebookLogin(): void {
    if (this.loginLoading) {
      return;
    }

    const accessToken = this.authenticationService.getFacebookAccessToken();
    if (accessToken) {
      const request: FacebookLoginRequest = {
        accessToken: accessToken
      };
      this.store$.dispatch(
        new UserFacebookActions.FacebookLoginRequestAction(request)
      );
    }
  }

  get emailOrUsername() {
    return this.loginForm.get('emailOrUsername');
  }
  get password() {
    return this.loginForm.get('password');
  }

  login(): void {
    if (this.loginLoading) {
      return;
    }
    if (!this.loginForm.valid) {
      validateAllFormFields(this.loginForm);
      return;
    }

    const loginRequest: LoginRequest = {
      emailOrUsername: this.emailOrUsername.value,
      password: this.password.value
    };

    this.errorMessage = '';
    this.loginLoading = true;
    this.authenticationService
      .loginUser(loginRequest)
      .pipe(take(1))
      .subscribe(
        (response: LoginResponse) => {
          const setUserStore: SetUserStore = {
            user: response.user
          };
          this.store$.dispatch(new UserActions.SetUserAction(setUserStore));
          this.authenticationService.loginUserSuccess(response);
        },
        (err: { error: SpotError }) => {
          // Displays the servers error message
          // Errors are kept to validation and generic
          this.errorMessage = err.error.message;
        },
        () => {
          this.loginLoading = false;
        }
      );
  }
}
