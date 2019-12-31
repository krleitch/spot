import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { STRINGS } from '@assets/strings/en';
import { AuthenticationService } from '@services/authentication.service';
import { LoginRequest } from '@models/authentication';
import { Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions } from '@store/accounts-store';

@Component({
  selector: 'spot-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.LOGIN;

  form: FormGroup;
  errorMessage: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private store$: Store<RootStoreState.State>) {
    this.form = this.fb.group({
      emailOrUsername: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
  }

  signIn() {
    const val = this.form.value;

    if (!val.emailOrUsername) {
      this.errorMessage = this.STRINGS.EMAIL_OR_USER_ERROR;
      this.form.controls.emailOrUsername.markAsDirty();
      return;
    }

    if (!val.password) {
      this.errorMessage = this.STRINGS.PASSWORD_ERROR;
      this.form.controls.password.markAsDirty();
      return;
    }

    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      emailOrUsername: val.emailOrUsername,
      password: this.authenticationService.md5Hash(val.password),
    };
    this.store$.dispatch(
      new AccountsActions.LoginRequestAction(loginRequest)
    );
  }

  register() {
    this.router.navigateByUrl('/register');
  }

}
