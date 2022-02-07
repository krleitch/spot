import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

// rxjs
import { Observable, Subject, merge, timer } from 'rxjs';
import { mapTo, take, takeUntil } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import {
  AccountsActions,
  AccountsFacebookActions,
  AccountsGoogleActions
} from '@store/accounts-store';
import { AccountsStoreSelectors, RootStoreState } from '@store';

// Services
import { AuthenticationService } from '@services/authentication.service';
import { AccountsService } from '@services/accounts.service';
import { ModalService } from '@services/modal.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '@services/theme.service';

// Models
import {
  Account,
  AccountMetadata,
  FacebookConnectRequest,
  FacebookDisconnectRequest,
  GoogleConnectRequest,
  GoogleDisconnectRequest,
  UpdateAccountMetadataRequest,
  UpdateEmailRequest,
  UpdateEmailResponse,
  UpdatePhoneRequest,
  UpdatePhoneResponse,
  UpdateUsernameRequest,
  UpdateUsernameResponse,
  VerifyRequest
} from '@models/accounts';
import { SpotError } from '@exceptions/error';

declare const gapi: any;

@Component({
  selector: 'spot-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  @ViewChild('editUsername') editUsernameInput: ElementRef;
  @ViewChild('editEmail') editEmailInput: ElementRef;
  @ViewChild('editPhone') editPhoneInput: ElementRef;

  account$: Observable<Account>;
  showAccountIndicator$: Observable<boolean>;
  accountMetadata$: Observable<AccountMetadata>;
  accountMetadata: AccountMetadata;

  verificationSent = false;

  email: string;
  editEmailEnabled = false;
  emailErrorMessage: string;
  emailSuccessMessage: string;

  username: string;
  editUsernameEnabled = false;
  usernameErrorMessage: string;
  usernameSuccessMessage: string;

  phone: string;
  editPhoneEnabled = false;
  phoneErrorMessage: string;
  phoneSuccessMessage: string;

  facebookConnected$: Observable<boolean>;
  googleConnected$: Observable<boolean>;

  accountOptionsEnabled: boolean;
  facebookLoaded = false;

  STRINGS;

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: ModalService,
    private accountsService: AccountsService,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService,
    private themeService: ThemeService
  ) {
    translateService.get('MAIN.ACCOUNT').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    this.accountMetadata$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountMetadata)
    );

    this.accountMetadata$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((metadata: AccountMetadata) => {
        this.accountMetadata = metadata;
      });

    this.facebookConnected$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectFacebookConnected)
    );

    this.googleConnected$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectGoogleConnected)
    );

    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccount)
    );

    this.showAccountIndicator$ = merge(
      timer(1000).pipe(mapTo(true), takeUntil(this.account$)),
      this.account$.pipe(mapTo(false))
    );

    this.account$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((account: Account) => {
        if (account) {
          this.username = account.username;
          this.email = account.email;
          this.phone = account.phone;
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  ngAfterViewInit(): void {
    this.authenticationService.socialServiceReady
      .pipe(takeUntil(this.onDestroy))
      .subscribe((service: string) => {
        if (service === 'google') {
          gapi.signin2.render('my-signin2', {
            scope: 'profile email',
            width: 240,
            height: 55,
            longtitle: true,
            theme: 'light',
            onsuccess: (param) => this.googleConnect(param)
          });
        }
        if (service === 'FB') {
          setTimeout(() => {
            this.facebookLoaded = true;
          });
        }
      });
  }

  formatBirthday(date: string) {
    const d = new Date(date);
    return d.toDateString();
  }

  enableEditUsername(): void {
    this.modalService.open('spot-confirm-modal', 'confirm', {
      message: this.STRINGS.USERNAME_CONFIRM
    });

    const result$ = this.modalService
      .getResult('spot-confirm-modal')
      .pipe(take(1));

    result$.subscribe((result: { status: string }) => {
      if (result.status === 'confirm') {
        this.editEmailEnabled = true;
        this.editUsernameEnabled = true;
        this.usernameErrorMessage = '';
        this.usernameSuccessMessage = '';

        setTimeout(() => {
          this.editUsernameInput.nativeElement.focus();
        }, 0);
      }
    });
  }

  enableEditEmail(): void {
    if (this.email) {
      this.modalService.open('spot-confirm-modal', 'confirm', {
        message: this.STRINGS.EMAIL_CONFIRM
      });

      const result$ = this.modalService
        .getResult('spot-confirm-modal')
        .pipe(take(1));

      result$.subscribe((result: { status: string }) => {
        if (result.status === 'confirm') {
          this.editEmailEnabled = true;
          this.emailErrorMessage = '';
          this.emailSuccessMessage = '';
          setTimeout(() => {
            this.editEmailInput.nativeElement.focus();
          }, 0);
        }
      });
    } else {
      this.editEmailEnabled = true;
      this.emailErrorMessage = '';
      this.emailSuccessMessage = '';
      setTimeout(() => {
        this.editEmailInput.nativeElement.focus();
      }, 0);
    }
  }

  enableEditPhone(): void {
    if (this.phone) {
      this.modalService.open('spot-confirm-modal', 'confirm', {
        message: this.STRINGS.PHONE_CONFIRM
      });

      const result$ = this.modalService
        .getResult('spot-confirm-modal')
        .pipe(take(1));

      result$.subscribe((result: { status: string }) => {
        if (result.status === 'confirm') {
          this.editPhoneEnabled = true;
          this.phoneErrorMessage = '';
          this.phoneSuccessMessage = '';
          setTimeout(() => {
            this.editPhoneInput.nativeElement.focus();
          }, 0);
        }
      });
    } else {
      this.editPhoneEnabled = true;
      setTimeout(() => {
        this.editPhoneInput.nativeElement.focus();
      }, 0);
    }
  }

  submitEditUsername(): void {
    this.usernameSuccessMessage = '';
    this.usernameErrorMessage = '';

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

    this.accountsService
      .updateUsername(request)
      .pipe(take(1))
      .subscribe(
        (response: UpdateUsernameResponse) => {
          this.usernameSuccessMessage = this.STRINGS.USERNAME_SUCCESS;
          this.editUsernameEnabled = false;

          // Update the store
          this.store$.dispatch(
            new AccountsActions.UpdateUsernameAction(request)
          );
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

    this.accountsService
      .updateEmail(request)
      .pipe(take(1))
      .subscribe(
        (response: UpdateEmailResponse) => {
          this.emailSuccessMessage = this.STRINGS.EMAIL_SUCCESS;
          this.editEmailEnabled = false;

          this.store$.dispatch(new AccountsActions.UpdateEmailAction(request));
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

    this.accountsService
      .updatePhone(request)
      .pipe(take(1))
      .subscribe(
        (response: UpdatePhoneResponse) => {
          this.phoneSuccessMessage = this.STRINGS.PHONE_SUCCESS;
          this.editPhoneEnabled = false;

          this.store$.dispatch(new AccountsActions.UpdatePhoneAction(request));
        },
        (err: { error: SpotError }) => {
          this.phoneErrorMessage = err.error.message;
        }
      );
  }

  deleteUser(): void {
    if (this.accountOptionsEnabled) {
      this.modalService.open('spot-confirm-modal', 'confirm');

      const result$ = this.modalService
        .getResult('spot-confirm-modal')
        .pipe(take(1));

      result$.subscribe((result: { status: string }) => {
        if (result.status === 'confirm') {
          this.store$.dispatch(new AccountsActions.DeleteRequestAction());
        }
      });
    }
  }

  verifyAccount(): void {
    if (this.email === '') {
      // give a warning probably
      // just should show maybe
      return;
    } else {
      const request: VerifyRequest = {};
      this.store$.dispatch(new AccountsActions.VerifyRequestAction(request));
      this.verificationSent = true;
    }
  }

  facebookConnect(): void {
    window['FB'].getLoginStatus((statusResponse) => {
      if (statusResponse.status !== 'connected') {
        window['FB'].login((loginResponse) => {
          if (loginResponse.status === 'connected') {
            // localStorage.removeItem('fb_access_token');
            // localStorage.removeItem('fb_expires_in');

            const request: FacebookConnectRequest = {
              accessToken: loginResponse.authResponse.accessToken
            };

            this.store$.dispatch(
              new AccountsFacebookActions.FacebookConnectRequestAction(request)
            );
          } else {
            // could not login
            // TODO some error msg
          }
        });
      } else {
        const request: FacebookConnectRequest = {
          accessToken: statusResponse.authResponse.accessToken
        };

        this.store$.dispatch(
          new AccountsFacebookActions.FacebookConnectRequestAction(request)
        );
      }
    });
  }

  facebookDisconnect(): void {
    const request: FacebookDisconnectRequest = {};

    this.store$.dispatch(
      new AccountsFacebookActions.FacebookDisconnectRequestAction(request)
    );
  }

  googleConnect(googleUser): void {
    // profile.getId(), getName(), getImageUrl(), getEmail()
    // const profile = googleUser.getBasicProfile();

    const id_token = googleUser.getAuthResponse().id_token;

    const request: GoogleConnectRequest = {
      accessToken: id_token
    };

    this.store$.dispatch(
      new AccountsGoogleActions.GoogleConnectRequestAction(request)
    );

    // sign out of the instance, so we don't auto login
    this.googleSignOut();
  }

  googleSignOut(): void {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {});
  }

  googleDisconnect(): void {
    const request: GoogleDisconnectRequest = {};

    this.store$.dispatch(
      new AccountsGoogleActions.GoogleDisconnectRequestAction(request)
    );
  }

  public setUnit(unit: string): void {
    const request: UpdateAccountMetadataRequest = {
      distance_unit: unit
    };

    this.store$.dispatch(
      new AccountsActions.UpdateAccountMetadataRequestAction(request)
    );
  }

  public setMature(value: boolean): void {
    const request: UpdateAccountMetadataRequest = {
      mature_filter: value
    };

    this.store$.dispatch(
      new AccountsActions.UpdateAccountMetadataRequestAction(request)
    );
  }

  public setTheme(theme: string) {
    if (theme === 'light') {
      this.themeService.setLightTheme();
    } else if (theme === 'dark') {
      this.themeService.setDarkTheme();
    } else {
      return;
    }
    const request: UpdateAccountMetadataRequest = {
      theme_web: theme
    };

    this.store$.dispatch(
      new AccountsActions.UpdateAccountMetadataRequestAction(request)
    );
  }
}
