import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { AccountsActions, RootStoreState } from '@store';
import { AuthenticationService } from '@services/authentication.service';
import { SetLocationRequest, GetAccountRequest, GetAccountMetadataRequest, LoadLocationRequest, LocationFailure } from '@models/accounts';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'spot';

  constructor(private store$: Store<RootStoreState.State>,
              private authenticationService: AuthenticationService) { }

  ngOnInit() {
    this.twitterLibrary();
    this.fbLibrary();
    this.getAccountIfExists();
    // TODO: move this to get only if account exists
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
    (window as any).fbAsyncInit = () => {
      window['FB'].init({
        appId      : '767513270350482',
        cookie     : true,
        xfbml      : true,
        version    : 'v4.0'
      });
      window['FB'].AppEvents.logPageView();
      this.authenticationService.sendSocialServiceReady('FB');
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

    // checks id_token exists and has not expired
    if ( this.authenticationService.isAuthenticated() ) {

      const request: GetAccountRequest = {};
      this.store$.dispatch(
        new AccountsActions.AccountRequestAction(request)
      );

    }

  }

  getAccountLocation() {

    // return a fake location if needed

    const request1: LoadLocationRequest = {};
    this.store$.dispatch(
      new AccountsActions.LoadLocationAction(request1)
    );

    const request2: SetLocationRequest = {
      // location: { longitude: -69.3333, latitude: 10.4444 }
      location: { longitude: -69.3333, latitude: 51.4444 }
    };
    this.store$.dispatch(
      // TODO send login location
      new AccountsActions.SetLocationAction(request2)
    );

    return;

    // END

    if (navigator.geolocation) {

      const request: LoadLocationRequest = {};
      this.store$.dispatch(
        new AccountsActions.LoadLocationAction(request)
      );

      navigator.geolocation.getCurrentPosition((position) => {

        const request: SetLocationRequest = {
          location: { longitude: position.coords.longitude, latitude: position.coords.latitude }
        };
        this.store$.dispatch(
          // TODO send login location
          new AccountsActions.SetLocationAction(request)
        );

      }, this.locationError.bind(this));
    } else {
      // browser doesnt support location
      // TODO: seperate error issue for this

      const request: LocationFailure = {
        error: 'browser support'
      };
      this.store$.dispatch(
        new AccountsActions.LocationFailureAction(request)
      );

    }
  }

  locationError(error) {

    // error.code of error.PERMISSION_DENIED, error.POSITION_UNAVAILABLE, error.TIMEOUT
    // hide the content
    // TODO: timeout errors for location can be an issue

    const request: LocationFailure = {
      error: error.code
    };
    this.store$.dispatch(
      new AccountsActions.LocationFailureAction(request)
    );

  }

}
