import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { take, finalize } from 'rxjs/operators';

// Services
import { AuthenticationService } from '@services/authentication.service';

// Assets
import {
  PasswordResetRequest,
  PasswordResetResponse
} from '@models/authentication';
import { SpotError } from '@exceptions/error';

// Validation
import {
  validateAllFormFields,
  VALID_EMAIL_REGEX
} from '@helpers/validators/validate-helpers';
import { forbiddenNameValidator } from '@helpers/validators/forbidden-name.directive';

@Component({
  selector: 'spot-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {
  resetForm: FormGroup;

  // state
  errorMessage = '';
  success = false;
  resetLoading = false;

  constructor(private authenticationService: AuthenticationService) {
    this.resetForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        forbiddenNameValidator(VALID_EMAIL_REGEX, 'allow')
      ])
    });
  }

  ngOnInit(): void {}

  get email() {
    return this.resetForm.get('email');
  }

  passwordReset(): void {
    if (this.resetLoading) {
      return;
    }

    if (!this.resetForm.valid) {
      validateAllFormFields(this.resetForm);
      return;
    }

    // Send request
    const request: PasswordResetRequest = {
      email: this.email.value
    };

    this.errorMessage = '';
    this.resetLoading = true;
    this.authenticationService
      .passwordReset(request)
      .pipe(
        take(1),
        finalize(() => {
          this.resetLoading = false;
        })
      )
      .subscribe(
        (_response: PasswordResetResponse) => {
          this.success = true;
        },
        (errorResponse: { error: SpotError }) => {
          this.errorMessage = errorResponse.error.message;
        }
      );
  }
}
