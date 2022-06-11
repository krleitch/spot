import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// rxjs
import { Observable, Subject, merge, timer } from 'rxjs';
import { mapTo, take, takeUntil } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { UserActions, UserFacebookActions } from '@store/user-store';
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
  DeleteUserRequest,
  DeleteUserResponse,
  VerifyRequest,
  VerifyResponse,
  SetUserStore,
  DeleteUserStore
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

@Component({
  selector: 'spot-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  eUserRole = UserRole;
  eUnitSystem = UnitSystem;
  eThemeWeb = ThemeWeb;

  user$: Observable<User>;
  user: User;
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

  STRINGS: Record<string, string>;

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: ModalService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService,
    private themeService: ThemeService,
    private router: Router
  ) {}

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
    this.user$.pipe(takeUntil(this.onDestroy)).subscribe((user: User) => {
      this.user = user;
    });

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
    this.translateService
      .get('MAIN.ACCOUNT')
      .subscribe((res: Record<string, string>) => {
        this.STRINGS = res;
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
          window.google.accounts.id.renderButton(
            document.getElementById('googleButtonAccount'),
            { theme: 'outline', size: 'large' } // customization attributes
          );
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
        imageSrc: this.profilePictureSrc || '/assets/images/op_large.png'
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

  changeAccountDetail(type: 'username' | 'phone' | 'email'): void {
    let data: string;
    switch (type) {
      case 'username':
        data = this.user.username;
        break;
      case 'phone':
        data = this.user.phone;
        break;
      case 'email':
        data = this.user.email;
        break;
    }
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
            const deleteRequest: DeleteUserRequest = {};
            this.userService
              .deleteUser(deleteRequest)
              .pipe(take(1))
              .subscribe(
                (_response: DeleteUserResponse) => {
                  const deleteStoreRequest: DeleteUserStore = {};
                  this.store$.dispatch(
                    new UserActions.DeleteUserAction(deleteStoreRequest)
                  );
                  this.router.navigateByUrl('/');
                },
                (_errorResponse: { error: SpotError }) => {
                  // none
                }
              );
          }
        });
    }
  }

  // verify
  verifyUser(): void {
    if (this.email === '') {
      // give a warning probably
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
    const accessToken = this.authenticationService.getFacebookAccessToken();
    if (accessToken) {
      const request: FacebookConnectRequest = {
        accessToken: accessToken
      };

      this.store$.dispatch(
        new UserFacebookActions.FacebookConnectRequestAction(request)
      );
    }
  }

  facebookDisconnect(): void {
    const request: FacebookDisconnectRequest = {};

    this.store$.dispatch(
      new UserFacebookActions.FacebookDisconnectRequestAction(request)
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
