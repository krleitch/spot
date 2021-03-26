import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { AuthenticationService } from '@services/authentication.service';

// Assets
import { STRINGS } from '@assets/strings/en';
import { ValidateTokenRequest, ValidateTokenSuccess, NewPasswordRequest, NewPasswordSuccess } from '@models/authentication';
import { SpotError } from '@exceptions/error';

@Component({
  selector: 'spot-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.NEW_PASSWORD;

  formToken: FormGroup;
  formPassword: FormGroup;
  errorMessage = '';
  successMessage = '';
  token = '';

  tokenLoading = false;
  passwordLoading = false;

  constructor(private fb: FormBuilder, private authenticationService: AuthenticationService, private router: Router) {
    this.formToken = this.fb.group({
      token: ['', Validators.required]
    });

    this.formPassword = this.fb.group({
      password: ['', Validators.required],
      confirm: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  validateToken(): void {

    const val = this.formToken.value;

    if ( !val.token ) {
      this.errorMessage = this.STRINGS.TOKEN_NONE;
      this.formToken.controls.token.markAsDirty();
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    // Send request

    this.tokenLoading = true;

    const request: ValidateTokenRequest = {
      token: val.token
    };

    this.authenticationService.validateToken(request).subscribe((response: ValidateTokenSuccess) => {
      if ( response.valid ) {
        this.token = response.token;
      } else {
        this.errorMessage = this.STRINGS.INVALID_TOKEN;
      }
      this.tokenLoading = false;
    }, ( errorResponse: any ) => {
      if ( errorResponse.error.name === 'RateLimitError' ) {
        this.errorMessage = this.STRINGS.RATE_LIMIT.replace('%TIMEOUT%', errorResponse.error.body.timeout);
      } else {
        this.errorMessage = this.STRINGS.INVALID_TOKEN;
      }
      this.tokenLoading = false;
    });

  }

  resetPassword(): void {

    const val = this.formPassword.value;

    if ( !val.password ) {
      this.errorMessage = this.STRINGS.PASSWORD_NONE;
      this.formPassword.controls.password.markAsDirty();
      return;
    }

    if ( !val.confirm ) {
      this.errorMessage = this.STRINGS.CONFIRM_NONE;
      this.formPassword.controls.confirm.markAsDirty();
      return;
    }

    if ( val.password !== val.confirm ) {
      this.errorMessage = this.STRINGS.INVALID_MATCH;
      this.formPassword.controls.password.markAsDirty();
      this.formPassword.controls.password.setErrors([{'incorrect': true}]);
      this.formPassword.controls.confirm.markAsDirty();
      this.formPassword.controls.confirm.setErrors([{'incorrect': true}]);
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    // Send request

    this.passwordLoading = true;

    const request: NewPasswordRequest = {
      token: this.token,
      password: val.password
    };

    this.authenticationService.newPassword(request).subscribe((response: NewPasswordSuccess) => {
      this.passwordLoading = false;
      this.successMessage = this.STRINGS.NEW_PASSWORD_SUCCESS;
    }, ( errorResponse: { error: SpotError } ) => {
      if ( errorResponse.error.name === 'RateLimitError' ) {
        this.errorMessage = this.STRINGS.RATE_LIMIT.replace('%TIMEOUT%', errorResponse.error.body.timeout);
      } else {
        this.errorMessage = errorResponse.error.message;
      }
      this.errorMessage = this.STRINGS.INVALID_TOKEN;
      this.passwordLoading = false;
    });

  }

  login(): void {
    this.router.navigateByUrl('/login');
  }

}
