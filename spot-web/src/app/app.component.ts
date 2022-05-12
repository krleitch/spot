/* eslint-disable prefer-const */
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

// Google sign in
import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';

// Store
import { Store, select } from '@ngrx/store';
import { UserActions, RootStoreState } from '@store';
import { UserStoreSelectors } from '@store/user-store';

// Services
import { AuthenticationService } from '@services/authentication.service';
import { ThemeService } from '@services/theme.service';
import { TranslateService } from '@ngx-translate/core';

// Models
import { GetUserRequest } from '@models/user';
import {
  SetLoadingLocation,
  SetLocationFailure,
  SetLocation
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
  isAuthenticated$: Observable<boolean>;

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
    // get auth status
    this.isAuthenticated$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsAuthenticated)
    );
    // For when gapi is loaded since it is async defer
    // window.addEventListener(
    //   'gapi-loaded',
    //   () => {
    //     gapi.load('auth2', () => {
    //       this.authenticationService.sendSocialServiceReady('google');
    //     });
    //   },
    //   { once: true }
    // );
    // (window as any).googleListenerAdded = true;
    //
    //

    // @ts-ignore
    window.onGoogleLibraryLoad = () => {
      console.log("Google's One-tap sign in script loaded!");
      this.authenticationService.sendSocialServiceReady('google');

      // @ts-ignore
      google.accounts.id.initialize({
        // Ref: https://developers.google.com/identity/gsi/web/reference/js-reference#IdConfiguration
        client_id:
          '773867677566-52gc54rg7909514ff2nvvi5oejlg0077.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this), // Whatever function you want to trigger...
        auto_select: true,
        cancel_on_tap_outside: false
      });

      // OPTIONAL: In my case I want to redirect the user to an specific path.
      // @ts-ignore
      // google.accounts.id.prompt((notification: PromptMomentNotification) => {
      //   console.log('Google prompt event triggered...');
      //
      //   if (notification.getDismissedReason() === 'credential_returned') {
      //     this.ngZone.run(() => {
      //       this.router.navigate(['myapp/somewhere'], { replaceUrl: true });
      //       console.log('Welcome back!');
      //     });
      //   }
      // });
    };

    // Init third party libaries
    this.twitterLibrary();
    this.fbLibrary();
    // Get User if JWT token exists
    this.getUserIfExists();
    // Get Location if permission was already granted
    this.getUserLocationIfPermitted();
  }

  handleCredentialResponse(response: CredentialResponse) {
    // Decoding  JWT token...
    let decodedToken: any | null = null;
    try {
      console.log(response);
      decodedToken = JSON.parse(atob(response?.credential.split('.')[1]));
    } catch (e) {
      console.error('Error while trying to decode token', e);
    }
    console.log('decodedToken', decodedToken);
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
