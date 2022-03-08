/* eslint-disable prefer-const */
import { Component, OnInit } from '@angular/core';

// Store
import { Store } from '@ngrx/store';
import { UserActions, RootStoreState } from '@store';

// Services
import { AuthenticationService } from '@services/authentication.service';
import { ThemeService } from '@services/theme.service';
import { TranslateService } from '@ngx-translate/core';

// Models
import { GetUserRequest } from '@models/user';
import {
  LoadLocationRequest,
  LocationFailure,
  SetLocationRequest
} from '@models/location';

declare const gapi: any;

@Component({
  selector: 'spot-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'spot';

  // TODO: this is wrong, subscribe to the $auth observable
  isAuth = this.authenticationService.isAuthenticated();

  constructor(
    private store$: Store<RootStoreState.State>,
    private authenticationService: AuthenticationService,
    private themeService: ThemeService,
    private translateService: TranslateService
  ) {}

  public ngOnInit(): void {
    // set the default sizings and theme
    this.themeService.setRegularSizeTheme();
    this.themeService.setLightTheme();
    // load translations
    this.translateService.setDefaultLang('en');
    this.translateService.use('en');
    // For when gapi is loaded since it is async defer
    window.addEventListener(
      'gapi-loaded',
      () => {
        this.authenticationService.sendSocialServiceReady('google');
      },
      { once: true }
    );
    (window as any).googleListenerAdded = true;
    // Init third party libaries
    this.twitterLibrary();
    this.fbLibrary();
    // Get User if JWT token exists
    this.getUserIfExists();
    // Get Location if permission was already granted
    this.getUserLocationIfPermitted();
  }

  private twitterLibrary(): void {
    window['twttr'] = (function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0],
        t = window['twttr'] || {};
      if (d.getElementById(id)) return t;
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://platform.twitter.com/widgets.js';
      fjs.parentNode.insertBefore(js, fjs);

      t._e = [];
      t.ready = function (f) {
        t._e.push(f);
      };

      return t;
    })(document, 'script', 'twitter-wjs');
  }

  private fbLibrary(): void {
    (window as any).fbAsyncInit = () => {
      window['FB'].init({
        appId: '767513270350482',
        cookie: true,
        xfbml: true,
        version: 'v4.0'
      });
      window['FB'].AppEvents.logPageView();
      this.authenticationService.sendSocialServiceReady('FB');
    };

    (function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }

  private getUserIfExists(): void {
    // checks id_token exists and has not expired
    if (this.authenticationService.isAuthenticated()) {
      const request: GetUserRequest = {};
      this.store$.dispatch(new UserActions.UserRequestAction(request));
    }
  }

  private getUserLocationIfPermitted(): void {
    // --------------
    // FAKE LOCATION
    // --------------

    // const request1: LoadLocationRequest = {};
    // this.store$.dispatch(
    //   new UserActions.LoadLocationAction(request1)
    // );

    // const request2: SetLocationRequest = {
    //   // location: { longitude: -69.3333, latitude: 10.4444 }
    //   location: { longitude: -69.3333, latitude: 51.4444 }
    // };
    // this.store$.dispatch(
    //   // TODO send login location
    //   new UserActions.SetLocationAction(request2)
    // );

    // return;

    // --------------
    // END
    // --------------

    // Only get location if permission is already given
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permission: PermissionStatus) => {
          if (permission.state === 'granted') {
            if (navigator.geolocation) {
              const loadLocationRequest: LoadLocationRequest = {};
              this.store$.dispatch(
                new UserActions.LoadLocationAction(loadLocationRequest)
              );

              navigator.geolocation.getCurrentPosition((position) => {
                const setLocationRequest: SetLocationRequest = {
                  location: {
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude
                  }
                };
                this.store$.dispatch(
                  new UserActions.SetLocationAction(setLocationRequest)
                );
              }, this.locationError.bind(this));
            } else {
              // geolocation not available in this browser
              const locationFailure: LocationFailure = {
                error: 'browser'
              };
              this.store$.dispatch(
                new UserActions.LocationFailureAction(locationFailure)
              );
            }
          } else if (permission.state === 'denied') {
            const locationFailure: LocationFailure = {
              error: 'permission'
            };
            this.store$.dispatch(
              new UserActions.LocationFailureAction(locationFailure)
            );
          } else {
            const locationFailure: LocationFailure = {
              error: 'prompt'
            };
            this.store$.dispatch(
              new UserActions.LocationFailureAction(locationFailure)
            );
          }
        });
    } else {
      // the permissions api isnt implemented in this browser so setup to prompt again
      const locationFailure: LocationFailure = {
        error: 'prompt'
      };
      this.store$.dispatch(
        new UserActions.LocationFailureAction(locationFailure)
      );
    }
  }

  private locationError(error: { message: string; code: number }): void {
    const locationFailure: LocationFailure = {
      error: error.code === 1 ? 'permission' : 'general'
    };
    this.store$.dispatch(
      new UserActions.LocationFailureAction(locationFailure)
    );
  }
}
