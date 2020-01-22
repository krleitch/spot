import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';

import { AccountsActions } from '@store/accounts-store';
import { AccountsStoreSelectors, RootStoreState } from '@store';
import { Account } from '@models/accounts';

@Component({
  selector: 'spot-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  account$: Observable<Account>;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {
    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsUser)
    );
  }

  deleteUser() {
    this.store$.dispatch(
      new AccountsActions.DeleteRequestAction()
    );
  }

}
