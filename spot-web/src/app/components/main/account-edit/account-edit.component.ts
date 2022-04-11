import { Component, OnInit } from '@angular/core';

// models
import { ModalAccountEditData } from '@models/modal';
import {
  UpdateEmailRequest,
  UpdateEmailResponse,
  UpdatePhoneRequest,
  UpdatePhoneResponse,
  UpdateUsernameRequest,
  UpdateUsernameResponse
} from '@models/user';

@Component({
  selector: 'spot-account-edit',
  templateUrl: './account-edit.component.html',
  styleUrls: ['./account-edit.component.scss']
})
export class AccountEditComponent implements OnInit {
  modalId: string;
  data: ModalAccountEditData;

  constructor() {}

  errorMessage: string;

  ngOnInit(): void {}

  /*
  submitEditUsername(): void {
    this.errorMessage = '';

    if (!this.username) {
      this.usernameErrorMessage = this.STRINGS.USERNAME_ERROR;
      return;
    }

    const validUsername = this.authenticationService.validateUsername(
      this.username
    );
    if (validUsername !== null) {
      this.usernameErrorMessage = validUsername;
      return;
    }

    const request: UpdateUsernameRequest = {
      username: this.username
    };

    this.userService
      .updateUsername(request)
      .pipe(take(1))
      .subscribe(
        (response: UpdateUsernameResponse) => {
          this.usernameSuccessMessage = this.STRINGS.USERNAME_SUCCESS;
          this.editUsernameEnabled = false;

          const request: SetUserStore = {
            user: { username: response.user.username }
          };
          // Update the store
          this.store$.dispatch(new UserActions.SetUserAction(request));
        },
        (err: { error: SpotError }) => {
          if (err.error.name === 'RateLimitError') {
            this.usernameErrorMessage =
              'You can only change your username once every 24 hours';
          } else {
            this.usernameErrorMessage = err.error.message;
          }
        }
      );
  }

  submitEditEmail(): void {
    this.emailSuccessMessage = '';
    this.emailErrorMessage = '';

    if (!this.email) {
      this.emailErrorMessage = this.STRINGS.EMAIL_ERROR;
      return;
    }

    const validEmail = this.authenticationService.validateEmail(this.email);
    if (!validEmail) {
      this.emailErrorMessage = this.STRINGS.EMAIL_INVALID;
      return;
    }

    const request: UpdateEmailRequest = {
      email: this.email
    };

    this.userService
      .updateEmail(request)
      .pipe(take(1))
      .subscribe(
        (response: UpdateEmailResponse) => {
          this.emailSuccessMessage = this.STRINGS.EMAIL_SUCCESS;
          this.editEmailEnabled = false;

          const request: SetUserStore = {
            user: { email: response.user.email }
          };
          this.store$.dispatch(new UserActions.SetUserAction(request));
        },
        (err: { error: SpotError }) => {
          this.emailErrorMessage = err.error.message;
        }
      );
  }

  submitEditPhone(): void {
    this.phoneSuccessMessage = '';
    this.phoneErrorMessage = '';

    if (!this.phone) {
      this.phoneErrorMessage = this.STRINGS.PHONE_ERROR;
      return;
    }

    const validEmail = this.authenticationService.validatePhone(this.phone);
    if (!validEmail) {
      this.phoneErrorMessage = this.STRINGS.PHONE_INVALID;
      return;
    }

    const request: UpdatePhoneRequest = {
      phone: this.phone
    };

    this.userService
      .updatePhone(request)
      .pipe(take(1))
      .subscribe(
        (response: UpdatePhoneResponse) => {
          this.phoneSuccessMessage = this.STRINGS.PHONE_SUCCESS;
          this.editPhoneEnabled = false;

          const request: SetUserStore = {
            user: { phone: response.user.phone }
          };
          this.store$.dispatch(new UserActions.SetUserAction(request));
        },
        (err: { error: SpotError }) => {
          this.phoneErrorMessage = err.error.message;
        }
      );
  }
  */
}
