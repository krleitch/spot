import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subject, timer, merge } from 'rxjs';
import { takeUntil, take, mapTo } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';

import { STRINGS } from '@assets/strings/en';
import { AccountsActions, AccountsFacebookActions } from '@store/accounts-store';
import { AccountsStoreSelectors, RootStoreState } from '@store';
import { AuthenticationService } from '@services/authentication.service';
import { AccountsService } from '@services/accounts.service';
import { Account, UpdateUsernameRequest, FacebookConnectRequest, FacebookDisconnectRequest, AccountMetadata,
         UpdateAccountMetadataRequest, VerifyRequest, UpdateEmailRequest, UpdatePhoneRequest, UpdateEmailResponse,
         UpdatePhoneResponse, UpdateUsernameResponse } from '@models/accounts';
import { SpotError } from '@exceptions/error';
import { ModalService } from '@services/modal.service';

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

  STRINGS = STRINGS.MAIN.ACCOUNT;

  account$: Observable<Account>;
  showAccountIndicator$: Observable<boolean>;
  accountMetadata$: Observable<AccountMetadata>;

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

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: ModalService,
              private accountsService: AccountsService,
              private authenticationService: AuthenticationService) { }

  ngOnInit() {

    this.accountMetadata$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountMetadata)
    );

    this.facebookConnected$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectFacebookConnected)
    );

    this.googleConnected$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectGoogleConnected)
    );

    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsUser)
    );

    this.showAccountIndicator$ = merge(
      timer(1000).pipe( mapTo(true), takeUntil(this.account$) ),
      this.account$.pipe( mapTo(false) ),
    );

    this.account$.pipe(takeUntil(this.onDestroy)).subscribe( ( account: Account ) => {
      if (account) {
        this.username = account.username;
        this.email = account.email;
        this.phone = account.phone;
      }
    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  ngAfterViewInit() {
    gapi.signin2.render('my-signin2', {
        scope: 'profile email',
        width: 240,
        height: 55,
        longtitle: true,
        theme: 'light',
        onsuccess: param => this.googleLogin(param)
    });
  }

  googleLogin(para) {

  }

  enableEditUsername() {
    this.editUsernameEnabled = true;
    setTimeout(() => {
      this.editUsernameInput.nativeElement.focus();
    }, 0);
  }

  enableEditEmail() {

    this.modalService.open('spot-confirm-modal', { message: this.STRINGS.EMAIL_CONFIRM });

    const result$ = this.modalService.getResult('spot-confirm-modal').pipe(take(1));

    result$.subscribe( (result: { status: string }) => {

      if ( result.status === 'confirm' ) {

        this.editEmailEnabled = true;
        setTimeout(() => {
          this.editEmailInput.nativeElement.focus();
        }, 0);

      }

    });

  }

  enableEditPhone() {

    if ( this.phone ) {

      this.modalService.open('spot-confirm-modal', { message: this.STRINGS.PHONE_CONFIRM });

      const result$ = this.modalService.getResult('spot-confirm-modal').pipe(take(1));

      result$.subscribe( (result: { status: string }) => {

        if ( result.status === 'confirm' ) {

          this.editPhoneEnabled = true;
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

  submitEditUsername() {

    if (!this.username) {
      this.usernameErrorMessage = this.STRINGS.USERNAME_ERROR;
      return;
    }

    const validUsername = this.authenticationService.validateUsername(this.username);
    if (validUsername !== null) {
      this.usernameErrorMessage = validUsername;
      return;
    }

    const request: UpdateUsernameRequest = {
      username: this.username
    };

    this.accountsService.updateUsername(request).pipe(take(1)).subscribe( (response: UpdateUsernameResponse ) => {

      this.usernameSuccessMessage = this.STRINGS.USERNAME_SUCCESS;

      this.store$.dispatch(
        new AccountsActions.UpdateUsernameAction(request)
      );

    }, (err: { error: SpotError }) => {

      this.emailErrorMessage = err.error.message;

    });

  }

  submitEditEmail() {

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
      email: this.username
    };

    this.accountsService.updateEmail(request).pipe(take(1)).subscribe( (response: UpdateEmailResponse ) => {

      this.emailSuccessMessage = this.STRINGS.EMAIL_SUCCESS;

      this.store$.dispatch(
        new AccountsActions.UpdateEmailAction(request)
      );

    }, (err: { error: SpotError }) => {

      this.emailErrorMessage = err.error.message;

    });

  }

  submitEditPhone() {

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

    this.accountsService.updatePhone(request).pipe(take(1)).subscribe( (response: UpdatePhoneResponse ) => {

      this.phoneSuccessMessage = this.STRINGS.PHONE_SUCCESS;

      this.store$.dispatch(
        new AccountsActions.UpdatePhoneAction(request)
      );

    }, (err: { error: SpotError }) => {

      this.phoneErrorMessage = err.error.message;

    });

  }

  deleteUser() {
    if ( this.accountOptionsEnabled ) {

      this.modalService.open('spot-confirm-modal');

      const result$ = this.modalService.getResult('spot-confirm-modal').pipe(take(1));

      result$.subscribe( (result: { status: string }) => {

        if ( result.status === 'confirm' ) {

          this.store$.dispatch(
            new AccountsActions.DeleteRequestAction()
          );

        }

      });

    }
  }

  verifyAccount() {
    const request: VerifyRequest = {};
    this.store$.dispatch(
      new AccountsActions.VerifyRequestAction(request)
    );
    this.verificationSent = true;
  }

  facebookConnect() {

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
          })
      } else {
        // already logged in
        // this.router.navigateByUrl('/home');
        // TODO THIS // ALSO LANDING
        window['FB'].logout();
      }
    });

  }

  facebookDisconnect() {

    const request: FacebookDisconnectRequest = {

    };

    this.store$.dispatch(
      new AccountsFacebookActions.FacebookDisconnectRequestAction(request)
    );

  }

  setImperial() {
    const request: UpdateAccountMetadataRequest = {
      distance_unit: 'imperial'
    };

    this.store$.dispatch(
      new AccountsActions.UpdateAccountMetadataRequestAction(request)
    );
  }

  setMetric() {
    const request: UpdateAccountMetadataRequest = {
      distance_unit: 'metric'
    };

    this.store$.dispatch(
      new AccountsActions.UpdateAccountMetadataRequestAction(request)
    );
  }

}
