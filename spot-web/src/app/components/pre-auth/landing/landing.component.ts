import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { STRINGS } from '@assets/strings/en';
import { AuthenticationService } from '@services/authentication.service';
import { RegisterRequest } from '@models/authentication';
import { Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions, AccountsFacebookActions } from '@store/accounts-store';
import { FacebookLoginRequest } from '@models/authentication';

@Component({
  selector: 'spot-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.LANDING;

  form: FormGroup;
  errorMessage: string;

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

  ngOnInit() { }

  facebookLogin() {

    window['FB'].getLoginStatus((statusResponse) => {
      if (statusResponse.status !== 'connected') {
          window['FB'].login((loginResponse) => {
            if (loginResponse.status === 'connected') {

                // localStorage.removeItem('fb_access_token');
                // localStorage.removeItem('fb_expires_in');


                const request: FacebookLoginRequest = {
                  accessToken: loginResponse.authResponse.accessToken
                };

                this.store$.dispatch(
                  new AccountsFacebookActions.FacebookLoginRequestAction(request)
                );

            } else {
              // could not login
              // TODO some error msg
            }
          })
      } else {
        // already logged in
        // this.router.navigateByUrl('/home');
        window['FB'].logout();
      }
    });

  }

  googleLogin() {
    console.log('googleLogin');
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

  signIn() {
    this.router.navigateByUrl('/login');
  }

}
