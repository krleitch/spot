import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Services
import { AuthenticationService } from '@services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

// Assets
import {
  PasswordResetRequest,
  PasswordResetResponse
} from '@models/authentication';
import { SpotError } from '@exceptions/error';
@Component({
  selector: 'spot-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  form: FormGroup;
  errorMessage = '';
  successMessage = '';
  buttonsDisabled = false;

  emailLoading = false;

  STRINGS;

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService
  ) {
    this.form = this.fb.group({
      email: ['', Validators.required]
    });
    this.translateService
      .get('PRE_AUTH.PASSWORD_RESET')
      .subscribe((res: any) => {
        this.STRINGS = res;
      });
  }

  ngOnInit(): void {}

  requestReset(): void {
    if (this.buttonsDisabled) {
      return;
    }

    const val = this.form.value;

    if (!val.email) {
      this.errorMessage = this.STRINGS.EMAIL_NONE;
      this.form.controls.email.markAsDirty();
      return;
    }

    const validEmail = this.authenticationService.validateEmail(val.email);
    if (!validEmail) {
      this.errorMessage = this.STRINGS.EMAIL_FORMAT;
      this.form.controls.email.markAsDirty();
      this.form.controls.email.setErrors([{ incorrect: true }]);
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    // Send request
    const request: PasswordResetRequest = {
      email: val.email
    };

    this.emailLoading = true;
    this.buttonsDisabled = true;
    this.authenticationService.passwordReset(request).subscribe(
      (response: PasswordResetResponse) => {
        this.buttonsDisabled = false;
        this.successMessage = this.STRINGS.REQUEST_SUCCESS;
        this.emailLoading = false;
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
        this.buttonsDisabled = false;
        this.emailLoading = false;
      }
    );
  }
}
