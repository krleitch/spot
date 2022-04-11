import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';

// store
import { Store } from '@ngrx/store';
import { UserActions } from '@store/user-store';
import { RootStoreState } from '@store';

// services
import { ModalService } from '@services/modal.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '@services/user.service';
import { AuthenticationService } from '@services/authentication.service';

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
import { SetUserStore } from '@models/user';
import { SpotError } from '@exceptions/error';

// validators
import { validateAllFormFields } from '@helpers/validators/validate-helpers';

@Component({
  selector: 'spot-account-edit',
  templateUrl: './account-edit.component.html',
  styleUrls: ['./account-edit.component.scss']
})
export class AccountEditComponent implements OnInit {
  modalId: string;
  data: ModalAccountEditData;

  STRINGS;

  // Form
  accountEditForm: FormGroup;

  propertyTitle: string;
  propertyPlaceholder: string;
  errorMessage: string;
  submitLoading = false;

  constructor(
    private modalService: ModalService,
    private store$: Store<RootStoreState.State>,
    private translateService: TranslateService,
    private userService: UserService,
    private authenticationService: AuthenticationService
  ) {
    translateService.get('MAIN.ACCOUNT_EDIT').subscribe((res) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    this.accountEditForm = new FormGroup({
      property: new FormControl('', [Validators.required])
    });
    switch (this.data.type) {
      case 'email':
        this.propertyTitle = this.STRINGS.EMAIL_TITLE;
        break;
      case 'username':
        this.propertyTitle = this.STRINGS.USERNAME_TITLE;
        break;
      case 'phone':
        this.propertyTitle = this.STRINGS.PHONE_TITLE;
        break;
    }
    this.propertyPlaceholder = this.data.data;
  }

  get property() {
    return this.accountEditForm.get('property');
  }

  submit(): void {
    if (this.accountEditForm.valid) {
      this.submitLoading = true;
      switch (this.data.type) {
        case 'email':
          this.submitEmail(this.property.value);
          break;
        case 'username':
          this.submitUsername(this.property.value);
          break;
        case 'phone':
          this.submitPhone(this.property.value);
          break;
      }
    } else {
      validateAllFormFields(this.accountEditForm);
    }
  }

  submitUsername(username: string): void {
    this.errorMessage = '';

    const validUsername = this.authenticationService.validateUsername(username);
    if (validUsername !== null) {
      this.errorMessage = validUsername;
      this.submitLoading = false;
      return;
    }

    const request: UpdateUsernameRequest = {
      username: username
    };

    this.userService
      .updateUsername(request)
      .pipe(take(1))
      .subscribe(
        (response: UpdateUsernameResponse) => {
          const request: SetUserStore = {
            user: { username: response.user.username }
          };
          // Update the store
          this.store$.dispatch(new UserActions.SetUserAction(request));
          this.submitLoading = false;
          this.close();
        },
        (err: { error: SpotError }) => {
          if (err.error.name === 'RateLimitError') {
            this.errorMessage =
              'You can only change your username once every 24 hours';
          } else {
            this.errorMessage = err.error.message;
          }
          this.submitLoading = false;
        }
      );
  }

  submitEmail(email: string): void {
    const validEmail = this.authenticationService.validateEmail(email);
    if (!validEmail) {
      this.errorMessage = this.STRINGS.EMAIL_INVALID;
      this.submitLoading = false;
      return;
    }

    const request: UpdateEmailRequest = {
      email: email
    };

    this.userService
      .updateEmail(request)
      .pipe(take(1))
      .subscribe(
        (response: UpdateEmailResponse) => {
          const request: SetUserStore = {
            user: { email: response.user.email }
          };
          this.store$.dispatch(new UserActions.SetUserAction(request));
          this.submitLoading = false;
          this.close();
        },
        (err: { error: SpotError }) => {
          this.errorMessage = err.error.message;
          this.submitLoading = false;
        }
      );
  }

  submitPhone(phone: string): void {
    const validEmail = this.authenticationService.validatePhone(phone);
    if (!validEmail) {
      this.errorMessage = this.STRINGS.PHONE_INVALID;
      this.submitLoading = false;
      return;
    }

    const request: UpdatePhoneRequest = {
      phone: phone
    };

    this.userService
      .updatePhone(request)
      .pipe(take(1))
      .subscribe(
        (response: UpdatePhoneResponse) => {
          const request: SetUserStore = {
            user: { phone: response.user.phone }
          };
          this.store$.dispatch(new UserActions.SetUserAction(request));
          this.submitLoading = false;
          this.close();
        },
        (err: { error: SpotError }) => {
          this.errorMessage = err.error.message;
          this.submitLoading = false;
        }
      );
  }

  close(): void {
    this.modalService.close(this.modalId);
  }
}
