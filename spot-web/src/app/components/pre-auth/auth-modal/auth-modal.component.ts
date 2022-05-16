import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { finalize, takeUntil, take } from 'rxjs/operators';

// Store
import { Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  UserActions,
  UserFacebookActions
} from '@src/app/root-store/user-store';

// Services
import { ModalService } from '@services/modal.service';
import { AuthenticationService } from '@services/authentication.service';

// Models
import {
  FacebookLoginRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from '@models/authentication';
import { SetUserStore } from '@models/user';
import { SpotError } from '@exceptions/error';

// Validators
import {
  validateAllFormFields,
  VALID_PASSWORD_REGEX,
  VALID_USERNAME_REGEX,
  VALID_EMAIL_REGEX,
  VALID_PHONE_REGEX
} from '@helpers/validators/validate-helpers';
import { forbiddenNameValidator } from '@helpers/validators/forbidden-name.directive';

// constants
import { AUTHENTICATION_CONSTANTS } from '@constants/authentication';

@Component({
  selector: 'spot-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  // Modal properties
  modalId: string;
  data; // unused

  selectedTab: 'login' | 'register' = 'login';

  // Login state
  loginForm: FormGroup;
  loginErrorMessage: string;
  loginLoading = false;
  loginShowPassword = false;

  // Register state
  registerForm: FormGroup;
  registerErrorMessage: string;
  registerLoading = false;
  registerShowPassword = false;

  // state
  facebookLoaded = false;

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: ModalService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      emailOrUsername: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });

    this.registerForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        forbiddenNameValidator(VALID_EMAIL_REGEX, 'allow')
      ]),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(AUTHENTICATION_CONSTANTS.USERNAME_MIN_LENGTH),
        Validators.maxLength(AUTHENTICATION_CONSTANTS.USERNAME_MAX_LENGTH),
        forbiddenNameValidator(VALID_USERNAME_REGEX, 'allow')
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(AUTHENTICATION_CONSTANTS.PASSWORD_MIN_LENGTH),
        Validators.maxLength(AUTHENTICATION_CONSTANTS.PASSWORD_MAX_LENGTH),
        forbiddenNameValidator(VALID_PASSWORD_REGEX, 'allow')
      ]),
      phone: new FormControl('', [
        Validators.required,
        forbiddenNameValidator(VALID_PHONE_REGEX, 'allow')
      ]),
      terms: new FormControl(false, [Validators.required])
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
          window.google.accounts.id.renderButton(
            document.getElementById('googleButtonRegister'),
            { theme: 'outline', size: 'large' } // customization attributes
          );
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

  toggleTab(): void {
    if (this.selectedTab === 'login') {
      this.selectedTab = 'register';
    } else {
      this.selectedTab = 'login';
    }
    this.loginErrorMessage = '';
    this.registerErrorMessage = '';
    this.loginForm.markAsPristine();
    this.registerForm.markAsPristine();
  }

  toggleLoginShowPassword(): void {
    this.loginShowPassword = !this.loginShowPassword;
  }

  get emailOrUsername() {
    return this.loginForm.get('emailOrUsername');
  }
  get loginPassword() {
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
      password: this.loginPassword.value
    };

    this.loginErrorMessage = '';
    this.loginLoading = true;
    this.authenticationService
      .loginUser(loginRequest)
      .pipe(
        take(1),
        finalize(() => {
          this.loginLoading = false;
        })
      )
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
          this.loginErrorMessage = err.error.message;
        }
      );
  }

  toggleRegisterShowPassword(): void {
    this.registerShowPassword = !this.registerShowPassword;
  }

  // Getters
  get email() {
    return this.registerForm.get('email');
  }
  get username() {
    return this.registerForm.get('username');
  }
  get registerPassword() {
    return this.registerForm.get('password');
  }
  get phone() {
    return this.registerForm.get('phone');
  }
  get terms() {
    return this.registerForm.get('terms');
  }

  register(): void {
    if (this.registerLoading) {
      return;
    }
    if (!this.registerForm.valid) {
      validateAllFormFields(this.registerForm);
      return;
    }

    const registerRequest: RegisterRequest = {
      email: this.email.value,
      username: this.username.value,
      password: this.registerPassword.value,
      phone: this.phone.value
    };

    this.registerErrorMessage = '';
    this.registerLoading = true;
    this.authenticationService
      .registerUser(registerRequest)
      .pipe(
        take(1),
        finalize(() => {
          this.registerLoading = false;
        })
      )
      .subscribe(
        (response: RegisterResponse) => {
          const setUserStore: SetUserStore = {
            user: response.user
          };
          this.store$.dispatch(new UserActions.SetUserAction(setUserStore));
          this.authenticationService.registerUserSuccess(response);
        },
        (err: { error: SpotError }) => {
          // Displays the servers error message
          // Errors are kept to validation and generic
          this.registerErrorMessage = err.error.message;
        }
      );
  }

  facebookLogin(): void {
    if (this.registerLoading) {
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

  openTerms(): void {
    this.modalService.open(
      'auth-modal-terms',
      'terms',
      {},
      { width: 700, disableClose: true, hideModals: true }
    );
  }
}
