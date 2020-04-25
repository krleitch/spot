import { Component, OnInit } from '@angular/core';
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

  constructor(private fb: FormBuilder, private authenticationService: AuthenticationService) {
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

}
