import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil, take, finalize } from 'rxjs/operators';

// Store
import { Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  UserActions,
  UserFacebookActions,
} from '@src/app/root-store/user-store';

// Services
import { AuthenticationService } from '@services/authentication.service';
import { ModalService } from '@services/modal.service';

// Models
import {
  FacebookLoginRequest,
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
  selector: 'spot-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  registerForm: FormGroup;

  // state
  errorMessage = '';
  showPassword = false;
  registerLoading = false;
  facebookLoaded = false;

  constructor(
    private authenticationService: AuthenticationService,
    private modalService: ModalService,
    private store$: Store<RootStoreState.State>
  ) {}

  ngOnInit(): void {
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
      password: this.password.value,
      phone: this.phone.value
    };

    this.errorMessage = '';
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
          this.errorMessage = err.error.message;
        }
      );
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
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
