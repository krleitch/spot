import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions, AccountsStoreSelectors } from '@store/accounts-store';
import { STRINGS } from '@assets/strings/en';
import { UpdateUsernameRequest, Account, UpdateUsernameResponse } from '@models/accounts';
import { SpotError } from '@exceptions/error';
import { AuthenticationService } from '@services/authentication.service';
import { AccountsService } from '@services/accounts.service';

@Component({
  selector: 'spot-username',
  templateUrl: './username.component.html',
  styleUrls: ['./username.component.scss']
})
export class UsernameComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  STRINGS = STRINGS.PRE_AUTH.USERNAME;

  account$: Observable<Account>;
  username: string;
  terms: boolean;
  errorMessage: string;

  constructor(private store$: Store<RootStoreState.State>,
              private authenticationService: AuthenticationService,
              private accountsService: AccountsService,
              private router: Router) { }

  ngOnInit() {

    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsUser)
    );

    this.account$.pipe(takeUntil(this.onDestroy)).subscribe( ( account: Account ) => {
      if (account) {
        this.username = account.username;
      }
    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  // Send the request
  continueToSpot() {

    console.log(this.terms)

    if (!this.terms) {
      this.errorMessage = this.STRINGS.TERMS_ERROR;
      return;
    }

    if (!this.username) {
      this.errorMessage = this.STRINGS.USERNAME_ERROR;
      return;
    }

    const validUsername = this.authenticationService.validateUsername(this.username);
    if (validUsername !== null) {
      this.errorMessage = validUsername;
      return;
    }

    const request: UpdateUsernameRequest = {
      username: this.username,
    };

    this.accountsService.updateUsername(request).pipe(take(1)).subscribe( (response: UpdateUsernameResponse ) => {

      this.store$.dispatch(
        new AccountsActions.UpdateUsernameAction(request),
      );

      this.router.navigateByUrl('/home');

    }, (err: { error: SpotError }) => {

      this.errorMessage = err.error.message;

    });

  }

}
