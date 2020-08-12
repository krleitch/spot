import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import { RootStoreState } from '@store';
import { AccountsActions } from '@store/accounts-store';
import { VerifyConfirmRequest } from '@models/accounts';

@Component({
  selector: 'spot-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit {

  constructor(private route: ActivatedRoute, private store$: Store<RootStoreState.State>) { }

  ngOnInit() {

    this.route.paramMap.subscribe( p => {

      const token = p.get('token');

      const request: VerifyConfirmRequest = {
        token
      };

      this.store$.dispatch(
        new AccountsActions.VerifyConfirmRequestAction(request)
      );

      // On a success, we can navigate to /home

    });

  }

}
