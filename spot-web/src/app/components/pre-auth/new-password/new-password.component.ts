import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

// rxjs
import { Subject } from 'rxjs';
import { take, finalize, takeUntil } from 'rxjs/operators';

// Services
import { AuthenticationService } from '@services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

// Assets
import {
  NewPasswordRequest,
  NewPasswordResponse,
  ValidateTokenRequest,
  ValidateTokenResponse
} from '@models/authentication';
import { SpotError } from '@exceptions/error';

// Validators
import {
  validateAllFormFields,
  VALID_PASSWORD_REGEX
} from '@helpers/validators/validate-helpers';
import { forbiddenNameValidator } from '@helpers/validators/forbidden-name.directive';

// Constants
import { AUTHENTICATION_CONSTANTS } from '@constants/authentication';

@Component({
  selector: 'spot-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  STRINGS: Record<string, string>;

  tokenForm: FormGroup;
  passwordForm: FormGroup;

  // token state
  link: string;
  validToken: string = '';
  tokenLoading = false;
  tokenError = '';

  // new password state
  showPassword = false;
  showConfirmPassword = false;
  passwordLoading = false;
  passwordError = '';
  passwordSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.tokenForm = new FormGroup({
      token: new FormControl('', [Validators.required])
    });

    this.passwordForm = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(AUTHENTICATION_CONSTANTS.PASSWORD_MIN_LENGTH),
        Validators.maxLength(AUTHENTICATION_CONSTANTS.PASSWORD_MAX_LENGTH),
        forbiddenNameValidator(VALID_PASSWORD_REGEX, 'allow')
      ]),
      confirm: new FormControl('', [Validators.required])
    });
    this.translateService
      .get('PRE_AUTH.NEW_PASSWORD')
      .subscribe((res: Record<string, string>) => {
        this.STRINGS = res;
      });
    // params
    this.route.paramMap.pipe(takeUntil(this.onDestroy)).subscribe((p: any) => {
      this.link = p.get('link');
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  // Getters
  get token() {
    return this.tokenForm.get('token');
  }

  validateToken(): void {
    if (this.tokenLoading) {
      return;
    }
    if (!this.tokenForm.valid) {
      validateAllFormFields(this.tokenForm);
      return;
    }

    // Send request
    this.tokenLoading = true;

    const request: ValidateTokenRequest = {
      link: this.link,
      token: this.token.value
    };

    this.authenticationService
      .validateToken(request)
      .pipe(
        take(1),
        finalize(() => {
          this.tokenLoading = false;
        })
      )
      .subscribe(
        (response: ValidateTokenResponse) => {
          this.validToken = this.token.value;
        },
        (errorResponse: { error: SpotError }) => {
          this.tokenError = '';
        }
      );
  }

  // Getters
  get password() {
    return this.passwordForm.get('password');
  }
  get confirm() {
    return this.passwordForm.get('confirm');
  }

  resetPassword(): void {
    if (this.passwordLoading) {
      return;
    }
    if (!this.passwordForm.valid) {
      validateAllFormFields(this.passwordForm);
      return;
    }

    if (this.password.value !== this.confirm.value) {
      this.confirm.setErrors({ 'forbiddenName': true });
      return;
    }

    this.passwordError = '';
    this.passwordSuccess = false;

    // Send request
    const request: NewPasswordRequest = {
      link: this.link,
      token: this.validToken,
      password: this.password.value
    };

    this.authenticationService
      .newPassword(request)
      .pipe(
        take(1),
        finalize(() => {
          this.passwordLoading = false;
        })
      )
      .subscribe(
        (response: NewPasswordResponse) => {
          this.passwordSuccess = true;
        },
        (errorResponse: { error: SpotError }) => {
          this.passwordError = '';
        }
      );
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }
  toggleShowConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
