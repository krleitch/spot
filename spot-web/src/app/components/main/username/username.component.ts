import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

// rxjs
import { Observable, Subject } from 'rxjs';
import { take, takeUntil, finalize } from 'rxjs/operators';

// store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  UserActions,
  UserStoreSelectors
} from '@src/app/root-store/user-store';

// services
import { UserService } from '@src/app/services/user.service';
import { ModalService } from '@services/modal.service';
import { TranslateService } from '@ngx-translate/core';

import {
  User,
  UpdateUsernameRequest,
  UpdateUsernameResponse,
  SetUserStore
} from '@models/user';
import { SpotError } from '@exceptions/error';

// Validators
import {
  validateAllFormFields,
  VALID_USERNAME_REGEX
} from '@helpers/validators/validate-helpers';
import { forbiddenNameValidator } from '@helpers/validators/forbidden-name.directive';

// constants
import { AUTHENTICATION_CONSTANTS } from '@constants/authentication';

@Component({
  selector: 'spot-username',
  templateUrl: './username.component.html',
  styleUrls: ['./username.component.scss']
})
export class UsernameComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  STRINGS: Record<string, string>;

  usernameForm: FormGroup;

  // state
  user$: Observable<User>;
  errorMessage: string;
  usernameLoading = false;

  constructor(
    private store$: Store<RootStoreState.State>,
    private userService: UserService,
    private modalService: ModalService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.usernameForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(AUTHENTICATION_CONSTANTS.USERNAME_MIN_LENGTH),
        Validators.maxLength(AUTHENTICATION_CONSTANTS.USERNAME_MAX_LENGTH),
        forbiddenNameValidator(VALID_USERNAME_REGEX, 'allow')
      ]),
      terms: new FormControl(false, [Validators.required])
    });
  }

  ngOnInit(): void {
    this.user$ = this.store$.pipe(select(UserStoreSelectors.selectUser));

    this.user$.pipe(takeUntil(this.onDestroy)).subscribe((user: User) => {
      if (user) {
        this.username.setValue(user.username);
      }
    });
    this.translateService.get('MAIN.USERNAME').subscribe((res: Record<string, string>) => {
      this.STRINGS = res;
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  get username() {
    return this.usernameForm.get('username');
  }
  get terms() {
    return this.usernameForm.get('terms');
  }

  // Send the request
  continueToSpot(): void {
    if (this.usernameLoading) {
      return;
    }
    if (!this.usernameForm.valid) {
      validateAllFormFields(this.usernameForm);
      return;
    }

    const request: UpdateUsernameRequest = {
      username: this.username.value
    };

    this.usernameLoading = true;
    this.userService
      .updateUsername(request)
      .pipe(
        take(1),
        finalize(() => {
          this.usernameLoading = false;
        })
      )
      .subscribe(
        (response: UpdateUsernameResponse) => {
          const request: SetUserStore = {
            user: { username: response.user.username }
          };
          this.store$.dispatch(new UserActions.SetUserAction(request));
          this.router.navigateByUrl('/home');
        },
        (errorResponse: { error: SpotError }) => {
          switch (errorResponse.error.name) {
            case 'UsernameTakenError':
              this.errorMessage = this.STRINGS.USERNAME_TAKEN;
              break;
            default:
              this.errorMessage = this.STRINGS.GENERIC_ERROR;
              break;
          }
        }
      );
  }

  openTerms(): void {
    this.modalService.open(
      'global',
      'terms',
      {},
      { width: 700, disableClose: true }
    );
  }
}
