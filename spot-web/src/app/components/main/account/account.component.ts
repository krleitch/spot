import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';

import { STRINGS } from '@assets/strings/en';
import { AccountsActions, AccountsFacebookActions } from '@store/accounts-store';
import { AccountsStoreSelectors, RootStoreState } from '@store';
import { AuthenticationService } from '@services/authentication.service';
import { Account, UpdateUsernameRequest, FacebookConnectRequest, FacebookDisconnectRequest, AccountMetadata,
         UpdateAccountMetadataRequest, VerifyRequest } from '@models/accounts';
import { SpotError } from '@exceptions/error';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'spot-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  @ViewChild('editUsername') editusernameinput: ElementRef;

  STRINGS = STRINGS.MAIN.ACCOUNT;

  account$: Observable<Account>;
  accountMetadata$: Observable<AccountMetadata>;

  facebookConnected$: Observable<boolean>;
  googleConnected$: Observable<boolean>;

  username: string;
  editUsernameEnabled = false;
  usernameError$: Observable<SpotError>;
  usernameErrorMessage: string;
  usernameSuccess$: Observable<boolean>;
  usernameSuccessMessage: string;

  accountOptionsEnabled: boolean;

  verificationSent = false;

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: ModalService,
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

    this.account$.subscribe( ( account: Account ) => {
      if (account) {
        this.username = account.username;
      }
    });

    this.usernameError$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectUsernameError)
    );

    this.usernameSuccess$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectUsernameSuccess)
    );

    this.usernameSuccess$.pipe(takeUntil(this.onDestroy)).subscribe( (success: boolean) => {
      if ( success ) {
        this.editUsernameEnabled = false;
        this.usernameErrorMessage = null;
        this.usernameSuccessMessage = this.STRINGS.USERNAME_SUCCESS;
      }
    });

    this.usernameError$.pipe(takeUntil(this.onDestroy)).subscribe( (error: SpotError) => {
      if ( error ) {
        this.usernameSuccessMessage = null;
        this.usernameErrorMessage = error.message;
      }
    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  enableEditUsername() {
    this.editUsernameEnabled = true;
    setTimeout(() => {
      this.editusernameinput.nativeElement.focus();
    }, 0);
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

    this.store$.dispatch(
      new AccountsActions.UpdateUsernameAction(request)
    );

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
