import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { AuthenticationService } from '@services/authentication.service';

// Assets
import { STRINGS } from '@assets/strings/en';
import { PasswordResetRequest, PasswordResetSuccess } from '@models/authentication';
import { SpotError } from '@exceptions/error';
@Component({
  selector: 'spot-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.PASSWORD_RESET;

  form: FormGroup;
  errorMessage = '';
  successMessage = '';

  emailLoading = false;

  constructor(private fb: FormBuilder, private authenticationService: AuthenticationService) {
    this.form = this.fb.group({
      email: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  requestReset(): void {

    const val = this.form.value;

    if ( !val.email ) {
      this.errorMessage = this.STRINGS.EMAIL_NONE;
      this.form.controls.email.markAsDirty();
      return;
    }

    const validEmail = this.authenticationService.validateEmail(val.email);
    if ( !validEmail ) {
      this.errorMessage = this.STRINGS.EMAIL_FORMAT;
      this.form.controls.email.markAsDirty();
      this.form.controls.email.setErrors([{'incorrect': true}]);
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    // Send request

    this.emailLoading = true;

    const request: PasswordResetRequest = {
      email: val.email
    };

    this.authenticationService.passwordReset(request).subscribe((response: PasswordResetSuccess) => {
      this.successMessage = this.STRINGS.REQUEST_SUCCESS;
      this.emailLoading = false;
    }, (errorResponse: { error: SpotError }) => {
      if ( errorResponse.error.name === 'RateLimitError' ) {
        this.errorMessage = this.STRINGS.RATE_LIMIT.replace('%TIMEOUT%', errorResponse.error.body.timeout);
      } else {
        this.errorMessage = errorResponse.error.message;
      }
      this.emailLoading = false;
    });

  }

}
