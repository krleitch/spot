import { TranslateService } from '@ngx-translate/core';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Observable, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  UserActions,
  UserFacebookActions,
  UserStoreSelectors
} from '@src/app/root-store/user-store';

// Services
import { AuthenticationService } from '@services/authentication.service';
import { ModalService } from '@services/modal.service';

// Models
import { FacebookLoginRequest, RegisterRequest } from '@models/authentication';
import { SpotError } from '@exceptions/error';

// Validators
import { validateAllFormFields, validateEmail, validatePhone, validatePassword, validateUsername } from '@helpers/validators/validate-helpers';

@Component({
  selector: 'spot-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  STRINGS: Record<string, string>;

  // Form controls
  registerForm: FormGroup;

  // State
  authenticationError$: Observable<SpotError>;
  isAuthenticated$: Observable<boolean>;
  errorMessage: string;
  buttonsDisabled = false;
  facebookLoaded = false;

  constructor(
    private authenticationService: AuthenticationService,
    private modalService: ModalService,
    private store$: Store<RootStoreState.State>,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    // Create form
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(256)
      ]),
      phone: new FormControl('', [Validators.required]),
      terms: new FormControl(false, [Validators.required])
    });

    // Get strings
    this.translateService
      .get('PRE_AUTH.LANDING')
      .subscribe((res: Record<string, string>) => {
        this.STRINGS = res;
      });

    // ERROR
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
        }
        this.buttonsDisabled = false;
      });

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
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  ngAfterViewInit(): void {
    this.authenticationService.socialServiceReady
      .pipe(takeUntil(this.onDestroy))
      .subscribe((service: string) => {
        if (service === 'FB') {
          setTimeout(() => {
            this.facebookLoaded = true;
          });
        }
        if (service === 'google') {
          window.google.accounts.id.renderButton(
            document.getElementById('googleButtonLanding'),
            { theme: 'outline', size: 'large' }
          );
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

  // Getters
  get email() {
    return this.registerForm.get('email');
  }
  get username() {
    return this.registerForm.get('username');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get phone() {
    return this.registerForm.get('phone');
  }
  get terms() {
    return this.registerForm.get('terms');
  }

  register(): void {
    if (this.buttonsDisabled) {
      return;
    }

    if (!this.registerForm.valid) {
      validateAllFormFields(this.registerForm);
    }

    // Validate username with regex
    if (!validateUsername(this.username.value)) {
      this.username.setErrors({ invald: true });
      return;
    }

    // Validate phone with regex
    if (!validatePassword(this.password.value)) {
      this.password.setErrors({ invald: true });
      return;
    }

    if (!validatePhone(this.phone.value)) {
      this.phone.setErrors({ invald: true });
      return;
    }

    this.errorMessage = '';
    const registerRequest: RegisterRequest = {
      email: this.email.value,
      username: this.username.value,
      password: this.password.value,
      phone: this.phone.value
    };

    this.store$.dispatch(
      new UserActions.RegisterRequestAction(registerRequest)
    );
    this.buttonsDisabled = true;
  }

  openTerms(): void {
    this.modalService.open(
      'global',
      'terms',
      {},
      { width: 700, disableClose: true }
    );
  }
}
