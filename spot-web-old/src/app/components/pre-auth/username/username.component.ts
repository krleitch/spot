import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import { AccountsActions } from '@store/accounts-store';
import { STRINGS } from '@assets/strings/en';
import { UpdateUsernameRequest } from '@models/accounts';

@Component({
  selector: 'spot-username',
  templateUrl: './username.component.html',
  styleUrls: ['./username.component.scss']
})
export class UsernameComponent implements OnInit {

  STRINGS = STRINGS.PRE_AUTH.USERNAME;

  username: string;

  constructor(private store$: Store<RootStoreState.State>, private router: Router) { }

  ngOnInit() {
  }

  continue() {

    const request: UpdateUsernameRequest = {
      username: this.username
    };

    this.store$.dispatch(
      new AccountsActions.UpdateUsernameAction(request)
    );

    this.router.navigateByUrl('/home');
  }

}
