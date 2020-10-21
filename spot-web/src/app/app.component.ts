import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { AccountsActions, RootStoreState } from '@store';
import { AuthenticationService } from '@services/authentication.service';
import { SetLocationRequest, GetAccountRequest, LoadLocationRequest, LocationFailure } from '@models/accounts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'spot';

  constructor(private store$: Store<RootStoreState.State>,
              private authenticationService: AuthenticationService) { }

  public ngOnInit() {
    this.twitterLibrary();
    this.fbLibrary();
    this.getAccountIfExists();
    this.getAccountLocation();
  }

  private twitterLibrary() {
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

  private fbLibrary() {
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

  private getAccountIfExists() {

    // checks id_token exists and has not expired
    if ( this.authenticationService.isAuthenticated() ) {

      const request: GetAccountRequest = {};
      this.store$.dispatch(
        new AccountsActions.AccountRequestAction(request),
      );

    }

  }

  private getAccountLocation() {

    // FAKE LOCATION

    // const request1: LoadLocationRequest = {};
    // this.store$.dispatch(
    //   new AccountsActions.LoadLocationAction(request1)
    // );

    // const request2: SetLocationRequest = {
    //   // location: { longitude: -69.3333, latitude: 10.4444 }
    //   location: { longitude: -69.3333, latitude: 51.4444 }
    // };
    // this.store$.dispatch(
    //   // TODO send login location
    //   new AccountsActions.SetLocationAction(request2)
    // );

    // return;

    // END

    if ( navigator.geolocation ) {

      const loadRequest: LoadLocationRequest = {};
      this.store$.dispatch(
        new AccountsActions.LoadLocationAction(loadRequest),
      );

      navigator.geolocation.getCurrentPosition((position) => {

        const request: SetLocationRequest = {
          location: { longitude: position.coords.longitude, latitude: position.coords.latitude },
        };
        this.store$.dispatch(
          new AccountsActions.SetLocationAction(request),
        );

      }, this.locationError.bind(this));

    } else {

      const request: LocationFailure = {
        error: 'browser',
      };
      this.store$.dispatch(
        new AccountsActions.LocationFailureAction(request),
      );

    }
  }

  private locationError(error: { message: string, code: number }) {

    const request: LocationFailure = {
      error: error.code === 1 ? 'permission' : 'general',
    };
    this.store$.dispatch(
      new AccountsActions.LocationFailureAction(request),
    );

  }

}
