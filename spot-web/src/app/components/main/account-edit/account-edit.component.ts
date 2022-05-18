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
import {
  validateAllFormFields,
  VALID_EMAIL_REGEX,
  VALID_PHONE_REGEX,
  VALID_USERNAME_REGEX
} from '@helpers/validators/validate-helpers';

@Component({
  selector: 'spot-account-edit',
  templateUrl: './account-edit.component.html',
  styleUrls: ['./account-edit.component.scss']
})
export class AccountEditComponent implements OnInit {
  modalId: string;
  data: ModalAccountEditData;

  STRINGS: Record<string, string>;

  // Form
  accountEditForm: FormGroup;

  propertyTitle: string;
  propertyDescription: string;
  propertyPlaceholder: string;
  errorMessage: string;
  submitLoading = false;

  constructor(
    private modalService: ModalService,
    private store$: Store<RootStoreState.State>,
    private translateService: TranslateService,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    this.accountEditForm = new FormGroup({
      property: new FormControl('', [Validators.required])
    });
    switch (this.data.type) {
      case 'email':
        this.propertyTitle = this.STRINGS.EMAIL_TITLE;
        this.propertyDescription = this.STRINGS.EMAIL_DESCRIPTION;
        break;
      case 'username':
        this.propertyTitle = this.STRINGS.USERNAME_TITLE;
        this.propertyDescription = this.STRINGS.USERNAME_DESCRIPTION;
        break;
      case 'phone':
        this.propertyTitle = this.STRINGS.PHONE_TITLE;
        this.propertyDescription = this.STRINGS.PHONE_DESCRIPTION;
        break;
    }
    this.propertyPlaceholder = this.data.data;
    this.translateService.get('MAIN.ACCOUNT_EDIT').subscribe((res: Record<string, string>) => {
      this.STRINGS = res;
    });
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

    const validUsername = username.match(VALID_USERNAME_REGEX);
    if (!validUsername) {
      this.errorMessage = this.STRINGS.USERNAME_INVALID;
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
          this.errorMessage = err.error.message;
          this.submitLoading = false;
        }
      );
  }

  submitEmail(email: string): void {
    const validEmail = email.match(VALID_EMAIL_REGEX);
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
    const validEmail = phone.match(VALID_PHONE_REGEX);
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
