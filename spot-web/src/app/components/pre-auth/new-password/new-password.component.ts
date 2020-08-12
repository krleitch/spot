import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { STRINGS } from '@assets/strings/en';
import { AuthenticationService } from '@services/authentication.service';
import { ValidateTokenRequest, ValidateTokenSuccess, NewPasswordRequest, NewPasswordSuccess } from '@models/authentication';

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

  constructor(private fb: FormBuilder, private authenticationService: AuthenticationService, private router: Router) {
    this.formToken = this.fb.group({
      token: ['', Validators.required]
    });

    this.formPassword = this.fb.group({
      password: ['', Validators.required],
      confirm: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  validateToken() {

    const val = this.formToken.value;

    if ( !val.token ) {
      this.errorMessage = this.STRINGS.TOKEN_NONE;
      this.formToken.controls.token.markAsDirty();
      return;
    }

    this.errorMessage = '';

    // Send request

    const request: ValidateTokenRequest = {
      token: val.token
    };

    this.authenticationService.validateToken(request).subscribe((response: ValidateTokenSuccess) => {
      this.token = val.token;
    }, ( error: any ) => {
      this.errorMessage = this.STRINGS.INVALID_TOKEN;
    });

  }

  resetPassword() {

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

    // Send request

    const request: NewPasswordRequest = {
      token: this.token,
      password: val.password
    };

    this.authenticationService.newPassword(request).subscribe((response: NewPasswordSuccess) => {
      this.router.navigateByUrl('/login');
      // Route to /login
    }, ( error: any ) => {
      this.errorMessage = this.STRINGS.INVALID_TOKEN;
    });

  }

}
