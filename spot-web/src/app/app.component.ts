/* eslint-disable prefer-const */
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

// Google sign in
import { CredentialResponse } from 'google-one-tap';

// Store
import { Store, select } from '@ngrx/store';
import { UserActions, RootStoreState } from '@store';
import { UserStoreSelectors, UserGoogleActions } from '@store/user-store';

// Services
import { AuthenticationService } from '@services/authentication.service';
import { ThemeService } from '@services/theme.service';
import { ChatService } from '@services/chat.service';
import { TranslateService } from '@ngx-translate/core';

// Models
import { GetUserRequest } from '@models/user';
import {
  SetLoadingLocation,
  SetLocationFailure,
  SetLocation
} from '@models/location';
import { GoogleLoginRequest } from '@models/authentication';
import { GoogleConnectRequest } from '@models/user';

import { LightTheme, DarkTheme } from '@styles/theme';

@Component({
  selector: 'spot-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'spot';

  isAuthenticated$: Observable<boolean>;
  isAuthenticated: boolean;

  constructor(
    private store$: Store<RootStoreState.State>,
    private authenticationService: AuthenticationService,
    private chatService: ChatService,
    private themeService: ThemeService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.setTheme();
    // load translations
    this.translateService.setDefaultLang('en');
    this.translateService.use('en');
    // get auth status
    this.isAuthenticated$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsAuthenticated)
    );
    // Connect/disconnect to chat network
    this.isAuthenticated$.subscribe((auth) => {
      if (auth) {
        this.chatService.connectToWebSocket();
      } else {
        this.chatService.disconnectFromWebSocket();
      }
      this.isAuthenticated = auth;
    });

    // Init third party libaries
    this.googleLibrary();
    this.fbLibrary();
    this.twitterLibrary();

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

  private googleLibrary(): void {
    // @ts-ignore
    window.onGoogleLibraryLoad = () => {
      // @ts-ignore
      google.accounts.id.initialize({
        // Ref: https://developers.google.com/identity/gsi/web/reference/js-reference#IdConfiguration
        client_id:
          '562475424621-665s55gudfsaq3usnb140dhmlfhs1ho1.apps.googleusercontent.com',
        callback: this.handleGoogleCredentialResponse.bind(this),
        auto_select: true,
        cancel_on_tap_outside: false
      });
      this.authenticationService.sendSocialServiceReady('google');
    };
  }

  private handleGoogleCredentialResponse(response: CredentialResponse) {
    // Decode JWT if you need any data, we will verify the token on the server again
    // const decodedToken = JSON.parse(atob(response?.credential.split('.')[1]));
    if (response.credential) {
      if (this.isAuthenticated) {
        // logged in so just connect
        const request: GoogleConnectRequest = {
          accessToken: response.credential
        };

        this.store$.dispatch(
          new UserGoogleActions.GoogleConnectRequestAction(request)
        );
      } else {
        // log in
        const request: GoogleLoginRequest = {
          accessToken: response.credential
        };

        this.store$.dispatch(
          new UserGoogleActions.GoogleLoginRequestAction(request)
        );
      }
    }
  }

  private setTheme(): void {
    // set the default sizings and theme
    const localTheme = localStorage.getItem('themeWeb');
    if (localTheme) {
      if (localTheme === LightTheme.name) {
        this.themeService.setLightTheme();
      } else if (localTheme === DarkTheme.name) {
        this.themeService.setDarkTheme();
      } else {
        this.themeService.setLightTheme();
      }
    }
    this.themeService.setRegularSizeTheme();
  }

  private getUserIfExists(): void {
    // checks id_token exists and has not expired
    if (this.authenticationService.isAuthenticated()) {
      const request: GetUserRequest = {};
      this.store$.dispatch(new UserActions.GetUserRequestAction(request));
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
              const setLoadingRequest: SetLoadingLocation = {};
              this.store$.dispatch(
                new UserActions.SetLoadingLocationAction(setLoadingRequest)
              );

              navigator.geolocation.getCurrentPosition((position) => {
                const setLocationRequest: SetLocation = {
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
              const locationFailure: SetLocationFailure = {
                error: 'browser'
              };
              this.store$.dispatch(
                new UserActions.SetLocationFailureAction(locationFailure)
              );
            }
          } else if (permission.state === 'denied') {
            const locationFailure: SetLocationFailure = {
              error: 'permission'
            };
            this.store$.dispatch(
              new UserActions.SetLocationFailureAction(locationFailure)
            );
          } else {
            const locationFailure: SetLocationFailure = {
              error: 'prompt'
            };
            this.store$.dispatch(
              new UserActions.SetLocationFailureAction(locationFailure)
            );
          }
        });
    } else {
      // the permissions api isnt implemented in this browser so setup to prompt again
      const locationFailure: SetLocationFailure = {
        error: 'prompt'
      };
      this.store$.dispatch(
        new UserActions.SetLocationFailureAction(locationFailure)
      );
    }
  }

  private locationError(error: { message: string; code: number }): void {
    const locationFailure: SetLocationFailure = {
      error: error.code === 1 ? 'permission' : 'general'
    };
    this.store$.dispatch(
      new UserActions.SetLocationFailureAction(locationFailure)
    );
  }
}
