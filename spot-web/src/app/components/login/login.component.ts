import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '@src/app/services/authentication.service';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AccountsActions, AccountsFacebookActions, AccountsStoreSelectors, RootStoreState } from '../../root-store';
import { Observable } from 'rxjs';
import { STRINGS } from '@assets/strings/en';

// import { LoginAccountRequest } from '@src/spot-commons/models/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  loggedIn$: Observable<boolean>;
  errorMessage: string;

  STRINGS = STRINGS.LOGIN;

  ngOnInit() {
    this.loggedIn$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectMyFeatureLoggedIn)
    );
  }

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    private store$: Store<RootStoreState.State>
  ) {
      this.form = this.fb.group({
          email: ['', Validators.required],
          password: ['', Validators.required]
      });
  }

  facebookLogin() {
    window['FB'].getLoginStatus((response) => {
      if (response.status !== 'connected') {
        window['FB'].login((response) => {
          if (response.authResponse) {
            localStorage.setItem('fb_access_token', response.authResponse.accessToken);
            localStorage.setItem("fb_expires_in", response.authResponse.expireIn);
            const request: any = {
              accessToken: response.authResponse.accessToken
            };
            this.store$.dispatch(
              new AccountsFacebookActions.FacebookRegisterRequestAction(request)
            );
          } else {
            console.log('User login failed');
          }
        });
      } else {
        const request: any = {
          accessToken: response.authResponse.accessToken
        };
        this.store$.dispatch(
          new AccountsFacebookActions.FacebookRegisterRequestAction(request)
        );
      }
    });
  }

  login() {
    const val = this.form.value;

    if (!val.email) {
      this.errorMessage = this.STRINGS.EMAIL_ERROR;
      this.form.controls['email'].markAsDirty();
      return;
    }

    if (!val.password) {
      this.errorMessage = this.STRINGS.PASSWORD_ERROR;
      this.form.controls['password'].markAsDirty();
      return;
    }

    const loginAccountRequest: any = {
      email: val.email,
      password: this.authenticationService.md5Hash(val.password)
    };
    this.store$.dispatch(
      new AccountsActions.AuthenticateRequestAction(loginAccountRequest)
    );
  }

  register() {
    this.router.navigateByUrl('/register');
  }

}
