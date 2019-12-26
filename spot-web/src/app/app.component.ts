import { AccountRequestAction } from '@src/app/root-store/accounts-store/actions/actions';
import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { AccountsActions, AccountsStoreSelectors, RootStoreState } from '@store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'spot-web';

  constructor(private store$: Store<RootStoreState.State>) {
    
  }

  ngOnInit() {
    this.fbLibrary();
    this.getUserIfExists();
  }

  fbLibrary() {
    (window as any).fbAsyncInit = function() {
      window['FB'].init({
        appId      : '767513270350482',
        cookie     : true,
        xfbml      : true,
        version    : 'v4.0'
      });
      window['FB'].AppEvents.logPageView();

    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  }

  getUserIfExists() {
    const accessToken = localStorage.getItem("fb_access_token");
    const idToken = localStorage.getItem("id_token");
    if (idToken) {
      this.store$.dispatch(
        new AccountsActions.AccountRequestAction()
      );
    } else if (accessToken) {
      // TODO fb login
    }
  }

}
