import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { STRINGS } from '@assets/strings/en';
import { AuthenticationService } from '@services/authentication.service';
import { RegisterRequest } from '@models/authentication';
import { Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions } from '@store/accounts-store';

@Component({
  selector: 'spot-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.REGISTER;

  form: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private store$: Store<RootStoreState.State>
  ) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  signUp() {
    const val = this.form.value;
    let valid = true;

    if (!val.email) {
      this.errorMessage = this.STRINGS.EMAIL_ERROR;
      this.form.controls.email.markAsDirty();
      return;
    }

    valid = this.authenticationService.validateEmail(val.email);
    if (!valid) {
      this.errorMessage = this.STRINGS.EMAIL_INVALID;
      this.form.controls.email.markAsDirty();
      return;
    }

    if (!val.username) {
      this.errorMessage = this.STRINGS.USERNAME_ERROR;
      this.form.controls.username.markAsDirty();
      return;
    }

    if (!val.password) {
      this.errorMessage = this.STRINGS.PASSWORD_ERROR;
      this.form.controls.password.markAsDirty();
      return;
    }

    if (!val.phone) {
      this.errorMessage = this.STRINGS.PHONE_ERROR;
      this.form.controls.phone.markAsDirty();
      return;
    }

    valid = this.authenticationService.validatePhone(val.phone);
    if (!valid) {
      this.errorMessage = this.STRINGS.PHONE_INVALID;
      this.form.controls.email.markAsDirty();
      return;
    }

    this.errorMessage = '';

    const registerRequest: RegisterRequest = {
      email: val.email,
      username: val.username,
      password: this.authenticationService.md5Hash(val.password),
      phone: val.phone
    };
    this.store$.dispatch(
      new AccountsActions.RegisterRequestAction(registerRequest)
    );
  }

  login() {
    this.router.navigateByUrl('/login');
  }

  facebookLogin() {

  }

  googleLogin() {

  }

}
