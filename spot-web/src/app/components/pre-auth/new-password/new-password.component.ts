import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

@Component({
  selector: 'spot-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit {
  STRINGS;

  formToken: FormGroup;
  formPassword: FormGroup;
  errorMessage = '';
  successMessage = '';
  token = '';

  tokenLoading = false;
  passwordLoading = false;
  buttonsDisabled = false;

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.formToken = this.fb.group({
      token: ['', Validators.required]
    });

    this.formPassword = this.fb.group({
      password: ['', Validators.required],
      confirm: ['', Validators.required]
    });
    this.translateService.get('PRE_AUTH.NEW_PASSWORD').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {}

  validateToken(): void {
    if (this.buttonsDisabled) {
      return;
    }

    const val = this.formToken.value;

    if (!val.token) {
      this.errorMessage = this.STRINGS.TOKEN_NONE;
      this.formToken.controls.token.markAsDirty();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    // Send request

    this.tokenLoading = true;
    this.buttonsDisabled = true;

    const request: ValidateTokenRequest = {
      token: val.token
    };

    this.authenticationService.validateToken(request).subscribe(
      (response: ValidateTokenResponse) => {
        // if (response) {
        this.token = val.token;
        // } else {
        //   this.errorMessage = this.STRINGS.INVALID_TOKEN;
        // }
        this.buttonsDisabled = false;
        this.tokenLoading = false;
      },
      (errorResponse: any) => {
        if (errorResponse.error.name === 'RateLimitError') {
          this.errorMessage = this.STRINGS.RATE_LIMIT.replace(
            '%TIMEOUT%',
            errorResponse.error.body.timeout
          );
        } else {
          this.errorMessage = this.STRINGS.INVALID_TOKEN;
        }
        this.buttonsDisabled = false;
        this.tokenLoading = false;
      }
    );
  }

  resetPassword(): void {
    if (this.buttonsDisabled) {
      return;
    }

    const val = this.formPassword.value;

    if (!val.password) {
      this.errorMessage = this.STRINGS.PASSWORD_NONE;
      this.formPassword.controls.password.markAsDirty();
      return;
    }

    if (!val.confirm) {
      this.errorMessage = this.STRINGS.CONFIRM_NONE;
      this.formPassword.controls.confirm.markAsDirty();
      return;
    }

    if (val.password !== val.confirm) {
      this.errorMessage = this.STRINGS.INVALID_MATCH;
      this.formPassword.controls.password.markAsDirty();
      this.formPassword.controls.password.setErrors([{ incorrect: true }]);
      this.formPassword.controls.confirm.markAsDirty();
      this.formPassword.controls.confirm.setErrors([{ incorrect: true }]);
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    // Send request

    this.passwordLoading = true;
    this.buttonsDisabled = true;

    const request: NewPasswordRequest = {
      token: this.token,
      password: val.password
    };

    this.authenticationService.newPassword(request).subscribe(
      (response: NewPasswordResponse) => {
        this.passwordLoading = false;
        this.buttonsDisabled = false;
        this.successMessage = this.STRINGS.NEW_PASSWORD_SUCCESS;
      },
      (errorResponse: { error: SpotError }) => {
        if (errorResponse.error.name === 'RateLimitError') {
          this.errorMessage = this.STRINGS.RATE_LIMIT.replace(
            '%TIMEOUT%',
            errorResponse.error.body.timeout
          );
        } else {
          this.errorMessage = errorResponse.error.message;
        }
        this.errorMessage = this.STRINGS.INVALID_TOKEN;
        this.passwordLoading = false;
        this.buttonsDisabled = false;
      }
    );
  }
}
