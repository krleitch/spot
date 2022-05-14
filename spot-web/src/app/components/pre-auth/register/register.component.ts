import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable, Subject } from 'rxjs';
import { skip, takeUntil, take } from 'rxjs/operators';

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
import { TranslateService } from '@ngx-translate/core';

// Models
import {
  FacebookLoginRequest,
  RegisterRequest,
  RegisterResponse
} from '@models/authentication';
import { SetUserStore } from '@models/user';
import { SpotError } from '@exceptions/error';

@Component({
  selector: 'spot-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  form: FormGroup;
  authenticationError$: Observable<SpotError>;
  isAuthenticated$: Observable<boolean>;
  errorMessage = '';
  buttonsDisabled = false;
  facebookLoaded = false;

  STRINGS;

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private modalService: ModalService,
    private store$: Store<RootStoreState.State>,
    private translateService: TranslateService
  ) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['', Validators.required],
      terms: [false, Validators.required]
    });
    this.translateService.get('PRE_AUTH.REGISTER').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {}

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

    const registerRequest: RegisterRequest = {
      email: val.email,
      username: val.username,
      password: val.password,
      phone: val.phone
    };

    this.errorMessage = '';
    this.buttonsDisabled = true;
    this.authenticationService
      .registerUser(registerRequest)
      .pipe(take(1))
      .subscribe(
        (response: RegisterResponse) => {
          const setUserStore: SetUserStore = {
            user: response.user
          };
          this.store$.dispatch(new UserActions.SetUserAction(setUserStore));
          this.buttonsDisabled = false;
        },

        (err: { error: SpotError }) => {
          // Displays the servers erorr message
          // Errors are kept to validation and generic
          this.errorMessage = err.error.message;
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

  openTerms(): void {
    this.modalService.open('global', 'terms');
  }
}
