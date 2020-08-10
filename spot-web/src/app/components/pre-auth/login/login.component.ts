import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { STRINGS } from '@assets/strings/en';
import { AuthenticationService } from '@services/authentication.service';
import { LoginRequest } from '@models/authentication';
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions, AccountsStoreSelectors } from '@store/accounts-store';
import { SpotError } from '@exceptions/error';

@Component({
  selector: 'spot-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.LOGIN;

  form: FormGroup;
  authError$: Observable<SpotError>;
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

    this.authError$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAuthenticationError)
    );

    this.authError$.pipe(map( (error: SpotError) => {
      this.errorMessage = error.message;
    }));

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

  googleLogin() {

  }

  facebookLogin() {

  }

  forgotPassword() {
    this.router.navigateByUrl('/password-reset');
  }

}
