import { AuthenticationService } from '@src/app/services/authentication.service';
import { Component, OnInit } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { ActionTypes, LoginSuccessAction, LoginFailureAction } from '@src/app/root-store/accounts-store/actions/actions';
import { AccountsActions, AccountsStoreSelectors, RootStoreState } from '../../../root-store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  user$: Observable<any>;

  constructor(private authenticationService: AuthenticationService,
              private store$: Store<RootStoreState.State>) { }

  ngOnInit() {
    this.user$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsUser)
    );
  }

  deleteUser() {
    this.store$.dispatch(
      new AccountsActions.DeleteRequestAction()
    );
  }

}
