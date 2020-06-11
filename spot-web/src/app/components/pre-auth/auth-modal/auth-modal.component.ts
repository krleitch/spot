import { Component, OnInit, Input } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { AccountsActions, AccountsStoreSelectors } from '@store/accounts-store';
import { ModalService } from '@services/modal.service';
import { AuthenticationService } from '@services/authentication.service';
import { LoginRequest, RegisterRequest } from '@models/authentication';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit {

  @Input() modalId: string;

  STRINGS = STRINGS.PRE_AUTH.AUTH_MODAL;

  selectedTab = 'login';

  loginForm: FormGroup;
  loginErrorMessage: string;
  registerForm: FormGroup;
  registerErrorMessage: string;

  errorMessage = '';

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: ModalService,
              private authenticationService: AuthenticationService,
              private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      emailOrUsername: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.registerForm = this.fb.group({
      email: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  close() {
    this.modalService.close(this.modalId);
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  login() {

    const val = this.loginForm.value;

    if (!val.emailOrUsername) {
      this.errorMessage = this.STRINGS.EMAIL_OR_USER_ERROR;
      this.loginForm.controls.emailOrUsername.markAsDirty();
      return;
    }

    if (!val.password) {
      this.errorMessage = this.STRINGS.PASSWORD_ERROR;
      this.loginForm.controls.password.markAsDirty();
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
    const val = this.registerForm.value;
    let valid = true;

    if (!val.email) {
      this.errorMessage = this.STRINGS.EMAIL_ERROR;
      this.registerForm.controls.email.markAsDirty();
      return;
    }

    valid = this.authenticationService.validateEmail(val.email);
    if (!valid) {
      this.errorMessage = this.STRINGS.EMAIL_INVALID;
      this.registerForm.controls.email.markAsDirty();
      return;
    }

    if (!val.username) {
      this.errorMessage = this.STRINGS.USERNAME_ERROR;
      this.registerForm.controls.username.markAsDirty();
      return;
    }

    if (!val.password) {
      this.errorMessage = this.STRINGS.PASSWORD_ERROR;
      this.registerForm.controls.password.markAsDirty();
      return;
    }

    if (!val.phone) {
      this.errorMessage = this.STRINGS.PHONE_ERROR;
      this.registerForm.controls.phone.markAsDirty();
      return;
    }

    valid = this.authenticationService.validatePhone(val.phone);
    if (!valid) {
      this.errorMessage = this.STRINGS.PHONE_INVALID;
      this.registerForm.controls.email.markAsDirty();
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

  forgotPassword() {

  }

  facebookLogin() {

  }

  googleLogin() {

  }

}
