import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';

import { STRINGS } from '@assets/strings/en';
import { AccountsActions, AccountsFacebookActions } from '@store/accounts-store';
import { AccountsStoreSelectors, RootStoreState } from '@store';
import { Account, UpdateUsernameRequest, FacebookConnectRequest } from '@models/accounts';

@Component({
  selector: 'spot-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  @ViewChild('editUsername') editusernameinput: ElementRef;

  STRINGS = STRINGS.MAIN.ACCOUNT;

  account$: Observable<Account>;
  facebookConnected$: Observable<boolean>;

  accountOptionsEnabled: boolean;
  editUsernameEnabled = false;
  username: string;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {

    this.facebookConnected$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectFacebookConnected)
    );

    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsUser)
    );

    this.account$.subscribe( ( account: Account ) => {
      if (account) {
        this.username = account.username;
      }
    });

  }

  enableEditUsername() {
    this.editUsernameEnabled = true;
    setTimeout(() => {
      this.editusernameinput.nativeElement.focus();
    }, 0);
  }

  submitEditUsername() {

    if (this.username) {
      const request: UpdateUsernameRequest = {
        username: this.username
      };

      this.store$.dispatch(
        new AccountsActions.UpdateUsernameAction(request)
      );

      this.editUsernameEnabled = false;
    }

  }

  deleteUser() {
    if ( this.accountOptionsEnabled ) {
      this.store$.dispatch(
        new AccountsActions.DeleteRequestAction()
      );
    }
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

}
