import { AccountRequestAction } from '@src/app/root-store/accounts-store/actions/actions';
import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';

import { AccountsActions, AccountsStoreSelectors, RootStoreState } from '@store';
import { SetLocationRequest } from '@models/accounts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'spot';

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {
    this.twitterLibrary();
    this.fbLibrary();
    this.getAccountIfExists();
    this.getAccountLocation();
  }

  twitterLibrary() {
    window['twttr'] = (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0],
        t = window['twttr'] || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);
    
      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };
    
      return t;
    }(document, "script", "twitter-wjs"));
  
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

  getAccountIfExists() {
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

  getAccountLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const request: SetLocationRequest = {
          location: { longitude: position.coords.longitude, latitude: position.coords.latitude }
        };
        this.store$.dispatch(
          new AccountsActions.SetLocationAction(request)
        );
      }, this.locationError.bind(this));
    } else {
      // browser doesnt support location
    }
  }

  locationError(error) {
    // error.code of error.PERMISSION_DENIED, error.POSITION_UNAVAILABLE, error.TIMEOUT
    // hide the content
    // TODO: timeout errors for location can be an issue
  }

}
