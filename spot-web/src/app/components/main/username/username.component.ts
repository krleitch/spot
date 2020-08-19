import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions, AccountsStoreSelectors } from '@store/accounts-store';
import { STRINGS } from '@assets/strings/en';
import { UpdateUsernameRequest, Account } from '@models/accounts';
import { SpotError } from '@exceptions/error';
import { AuthenticationService } from '@services/authentication.service';

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
  usernameError$: Observable<SpotError>;
  errorMessage: string;
  usernameSuccess$: Observable<boolean>;

  constructor(private store$: Store<RootStoreState.State>,
              private authenticationService: AuthenticationService,
              private router: Router) { }

  ngOnInit() {

    this.usernameError$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectUsernameError)
    );

    this.usernameSuccess$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectUsernameSuccess)
    );

    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsUser)
    );

    this.account$.subscribe( ( account: Account ) => {
      if (account) {
        this.username = account.username;
      }
    });

    // If the username changed, then continue to spot
    this.usernameSuccess$.pipe(takeUntil(this.onDestroy)).subscribe( (success: boolean) => {
      if ( success ) {
        this.router.navigateByUrl('/home');
      }
    });

    this.usernameError$.pipe(takeUntil(this.onDestroy)).subscribe( (error: SpotError) => {
      if ( error ) {
        this.errorMessage = error.message;
      }
    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  // Send the request
  continueToSpot() {

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
      username: this.username
    };

    this.store$.dispatch(
      new AccountsActions.UpdateUsernameAction(request)
    );

  }

}
