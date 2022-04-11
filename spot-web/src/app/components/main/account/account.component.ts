import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

// rxjs
import { Observable, Subject, merge, timer } from 'rxjs';
import { mapTo, take, takeUntil } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import {
  UserActions,
  UserFacebookActions,
  UserGoogleActions
} from '@store/user-store';
import { UserStoreSelectors, RootStoreState } from '@store';

// Services
import { AuthenticationService } from '@services/authentication.service';
import { UserService } from '@src/app/services/user.service';
import { ModalService } from '@services/modal.service';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '@services/theme.service';

// Models
import {
  User,
  UserRole,
  FacebookConnectRequest,
  FacebookDisconnectRequest,
  GoogleConnectRequest,
  GoogleDisconnectRequest,
  UpdateEmailRequest,
  UpdateEmailResponse,
  UpdatePhoneRequest,
  UpdatePhoneResponse,
  UpdateUsernameRequest,
  UpdateUsernameResponse,
  DeleteUserRequest,
  VerifyRequest,
  VerifyResponse,
  SetUserStore
} from '@models/user';
import {
  UserMetadata,
  UpdateUserMetadataRequest,
  UnitSystem,
  ThemeWeb
} from '@models/userMetadata';
import { SpotError } from '@exceptions/error';
import {
  ModalConfirmResult,
  ModalConfirmResultTypes,
  ModalUploadPhotoResult
} from '@models/modal';

declare const gapi: any;

@Component({
  selector: 'spot-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  @ViewChild('editUsername') editUsernameInput: ElementRef;
  @ViewChild('editEmail') editEmailInput: ElementRef;
  @ViewChild('editPhone') editPhoneInput: ElementRef;

  eUserRole = UserRole;
  eUnitSystem = UnitSystem;
  eThemeWeb = ThemeWeb;

  user$: Observable<User>;
  showUserIndicator$: Observable<boolean>;
  userMetadata$: Observable<UserMetadata>;
  userMetadata: UserMetadata;

  verificationSent = false;
  profilePictureSrc: string;

  email: string;
  editEmailEnabled = false;
  emailErrorMessage: string;
  emailSuccessMessage: string;

  username: string;
  editUsernameEnabled = false;
  usernameErrorMessage: string;
  usernameSuccessMessage: string;

  phone: string;
  editPhoneEnabled = false;
  phoneErrorMessage: string;
  phoneSuccessMessage: string;

  facebookConnected$: Observable<boolean>;
  googleConnected$: Observable<boolean>;

  userOptionsEnabled: boolean;
  facebookLoaded = false;

  STRINGS;

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: ModalService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService,
    private themeService: ThemeService
  ) {
    translateService.get('MAIN.ACCOUNT').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    this.userMetadata$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserMetadata)
    );

    this.userMetadata$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((metadata: UserMetadata) => {
        this.userMetadata = metadata;
      });

    this.facebookConnected$ = this.store$.pipe(
      select(UserStoreSelectors.selectFacebookConnected)
    );

    this.googleConnected$ = this.store$.pipe(
      select(UserStoreSelectors.selectGoogleConnected)
    );

    this.user$ = this.store$.pipe(select(UserStoreSelectors.selectUser));

    this.showUserIndicator$ = merge(
      timer(1000).pipe(mapTo(true), takeUntil(this.user$)),
      this.user$.pipe(mapTo(false))
    );

    this.user$.pipe(takeUntil(this.onDestroy)).subscribe((user: User) => {
      if (user) {
        this.username = user.username;
        this.email = user.email;
        this.phone = user.phone;
        this.profilePictureSrc = user.profilePictureSrc;
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  ngAfterViewInit(): void {
    this.authenticationService.socialServiceReady
      .pipe(takeUntil(this.onDestroy))
      .subscribe((service: string) => {
        if (service === 'google') {
          gapi.signin2.render('my-signin2', {
            scope: 'profile email',
            width: 240,
            height: 55,
            longtitle: true,
            theme: 'light',
            onsuccess: (param) => this.googleConnect(param)
          });
        }
        if (service === 'FB') {
          setTimeout(() => {
            this.facebookLoaded = true;
          });
        }
      });
  }

  formatBirthday(date: string) {
    const d = new Date(date);
    return d.toDateString();
  }

  openUploadPhotoModal(): void {
    this.modalService
      .open('global', 'uploadPhoto', {
        type: 'profile-picture',
        imageSrc:
          this.profilePictureSrc || '../../../../assets/images/op_large.png'
      })
      .pipe(take(1))
      .subscribe((result: ModalUploadPhotoResult) => {
        const request: SetUserStore = {
          user: {
            profilePictureSrc: result.imageSrc
          }
        };
        this.store$.dispatch(new UserActions.SetUserAction(request));
      });
  }

  changeAccountDetail(
    type: 'username' | 'phone' | 'email',
    data: string
  ): void {
    this.modalService.open('global', 'accountEdit', {
      type: type,
      data: data
    });
  }

  deleteUser(): void {
    if (this.userOptionsEnabled) {
      this.modalService
        .open('global', 'confirm')
        .pipe(take(1))
        .subscribe((result: ModalConfirmResult) => {
          if (result.status === ModalConfirmResultTypes.CONFIRM) {
            const request: DeleteUserRequest = {};
            this.store$.dispatch(new UserActions.DeleteRequestAction(request));
          }
        });
    }
  }

  // verify

  verifyUser(): void {
    if (this.email === '') {
      // give a warning probably
      // just should show maybe
      return;
    } else {
      const request: VerifyRequest = {};
      this.userService
        .verifyUser(request)
        .pipe(take(1))
        .subscribe((_response: VerifyResponse) => {
          this.verificationSent = true;
        });
    }
  }

  // facebook

  facebookConnect(): void {
    window['FB'].getLoginStatus((statusResponse) => {
      if (statusResponse.status !== 'connected') {
        window['FB'].login((loginResponse) => {
          if (loginResponse.status === 'connected') {
            // localStorage.removeItem('fb_access_token');
            // localStorage.removeItem('fb_expires_in');

            const request: FacebookConnectRequest = {
              accessToken: loginResponse.authResponse.accessToken
            };

            this.store$.dispatch(
              new UserFacebookActions.FacebookConnectRequestAction(request)
            );
          } else {
            // could not login
            // TODO some error msg
          }
        });
      } else {
        const request: FacebookConnectRequest = {
          accessToken: statusResponse.authResponse.accessToken
        };

        this.store$.dispatch(
          new UserFacebookActions.FacebookConnectRequestAction(request)
        );
      }
    });
  }

  facebookDisconnect(): void {
    const request: FacebookDisconnectRequest = {};

    this.store$.dispatch(
      new UserFacebookActions.FacebookDisconnectRequestAction(request)
    );
  }

  // Google

  googleConnect(googleUser): void {
    // profile.getId(), getName(), getImageUrl(), getEmail()
    // const profile = googleUser.getBasicProfile();

    const id_token = googleUser.getAuthResponse().id_token;

    const request: GoogleConnectRequest = {
      accessToken: id_token
    };

    this.store$.dispatch(
      new UserGoogleActions.GoogleConnectRequestAction(request)
    );

    // sign out of the instance, so we don't auto login
    this.googleSignOut();
  }

  googleSignOut(): void {
    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {});
  }

  googleDisconnect(): void {
    const request: GoogleDisconnectRequest = {};

    this.store$.dispatch(
      new UserGoogleActions.GoogleDisconnectRequestAction(request)
    );
  }

  // Settings

  public toggleUnitSystem(): void {
    let unitSystem: UnitSystem;
    if (this.userMetadata.unitSystem === UnitSystem.IMPERIAL) {
      unitSystem = UnitSystem.METRIC;
    } else {
      unitSystem = UnitSystem.IMPERIAL;
    }
    const request: UpdateUserMetadataRequest = {
      unitSystem
    };
    this.store$.dispatch(
      new UserActions.UpdateUserMetadataRequestAction(request)
    );
  }

  public toggleMatureFilter(): void {
    let matureFilter: boolean;
    if (this.userMetadata.matureFilter) {
      matureFilter = false;
    } else {
      matureFilter = true;
    }
    const request: UpdateUserMetadataRequest = {
      matureFilter
    };
    this.store$.dispatch(
      new UserActions.UpdateUserMetadataRequestAction(request)
    );
  }

  public toggleTheme(): void {
    let themeWeb: ThemeWeb;
    if (this.userMetadata.themeWeb === ThemeWeb.LIGHT) {
      this.themeService.setDarkTheme();
      themeWeb = ThemeWeb.DARK;
    } else {
      this.themeService.setLightTheme();
      themeWeb = ThemeWeb.LIGHT;
    }
    const request: UpdateUserMetadataRequest = {
      themeWeb
    };
    this.store$.dispatch(
      new UserActions.UpdateUserMetadataRequestAction(request)
    );
  }
}
