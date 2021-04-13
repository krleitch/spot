import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

// rxjs
import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

// store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions, AccountsStoreSelectors } from '@store/accounts-store';

// services
import { AuthenticationService } from '@services/authentication.service';
import { AccountsService } from '@services/accounts.service';
import { ModalService } from '@services/modal.service';

// assets
import { STRINGS } from '@assets/strings/en';
import { UpdateUsernameRequest, Account, UpdateUsernameResponse } from '@models/accounts';
import { SpotError } from '@exceptions/error';

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
  buttonsDisabled = false;

  constructor(private store$: Store<RootStoreState.State>,
              private authenticationService: AuthenticationService,
              private accountsService: AccountsService,
              private modalService: ModalService,
              private router: Router) { }

  ngOnInit(): void {

    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccount)
    );

    this.account$.pipe(takeUntil(this.onDestroy)).subscribe( ( account: Account ) => {
      if (account) {
        this.username = account.username;
      }
    });

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  // Send the request
  continueToSpot(): void {

    if ( this.buttonsDisabled ) {
      return;
    }

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

    this.buttonsDisabled = true;
    this.accountsService.updateUsername(request).pipe(take(1)).subscribe( (response: UpdateUsernameResponse ) => {

      this.buttonsDisabled = false;
      this.store$.dispatch(
        new AccountsActions.UpdateUsernameAction(request),
      );

      this.router.navigateByUrl('/home');

    }, (err: { error: SpotError }) => {

      this.errorMessage = err.error.message;
      this.buttonsDisabled = false;

    });

  }

  openTerms(): void {
    this.modalService.open('spot-terms-modal');
  }

}
