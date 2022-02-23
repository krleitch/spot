import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

// rxjs
import { Observable, Subject, concat, interval, of, timer } from 'rxjs';
import {
  distinctUntilChanged,
  mapTo,
  skipWhile,
  startWith,
  take,
  takeUntil,
  takeWhile
} from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { PostsStoreActions, PostsStoreSelectors } from '@store/posts-store';
import {
  UserActions,
  UserStoreSelectors
} from '@src/app/root-store/user-store';

// Models
import { LoadPostRequest, Post } from '@models/posts';
import { User, VerifyRequest, UserRole } from '@models/../newModels/user';
import {
  UserMetadata,
  UpdateUserMetadataRequest,
  SearchType,
  LocationType,
  UnitSystem
} from '@models/../newModels/userMetadata';
import {
  LoadLocationRequest,
  LocationFailure,
  SetLocationRequest,
  LocationData
} from '@models/../newModels/location';

// Assets
import { LOCATIONS_CONSTANTS } from '@constants/locations';
import { POSTS_CONSTANTS } from '@constants/posts';

@Component({
  selector: 'spot-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  private readonly stop$ = new Subject<void>(); // Used to cancel loading posts

  POSTS_CONSTANTS = POSTS_CONSTANTS;

  // Posts
  posts$: Observable<Post[]>;
  posts: Post[] = [];
  showPostsIndicator$: Observable<boolean>;
  loading$: Observable<boolean>;
  loading: boolean;
  noPosts$: Observable<boolean>;
  noPosts: boolean;

  // Location
  loadingLocation$: Observable<boolean>;
  loadingLocation: boolean;
  bypassLocation = false; // if true we will not wait for location to load for posts
  location$: Observable<LocationData>;
  location: LocationData = null;
  showLocationIndicator$: Observable<boolean>;
  locationFailure$: Observable<string>;
  locationFailure: string;
  locationTimeReceived$: Observable<Date>;
  locationTimeReceived: Date;

  // User
  user$: Observable<User>;
  user: User;
  userMetadata$: Observable<UserMetadata>;

  // Metadata
  eLocationType = LocationType; // for use in view
  eSearchType = SearchType; // for use in view
  eUserRole = UserRole;
  locationType: LocationType | undefined = undefined;
  searchType: SearchType | undefined = undefined;
  unitSystem = UnitSystem.METRIC;

  // State
  loadedPosts: number; // offset for loaded posts for 'hot'
  initialLoad = true; // is this the first load?
  verificationSent = false;

  // Dropdowns
  @ViewChild('mobiledropdownlocation') mobileDropdownLocation: ElementRef;
  dropdownLocationEnabled = false;
  @ViewChild('mobiledropdownsort') mobileDropdownSort: ElementRef;
  dropdownSortEnabled = false;
  @ViewChild('bottom') bottom: ElementRef;

  constructor(private store$: Store<RootStoreState.State>) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit(): void {
    // User
    this.user$ = this.store$.pipe(select(UserStoreSelectors.selectUser));

    this.user$.pipe(takeUntil(this.onDestroy)).subscribe((user: User) => {
      this.user = user;
    });

    this.userMetadata$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserMetadata)
    );

    this.userMetadata$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((metadata: UserMetadata) => {
        if (metadata) {
          this.locationType = metadata.locationType;
          this.searchType = metadata.searchType;
          this.unitSystem = metadata.unitSystem;
        }
      });

    // Location
    this.location$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocation)
    );

    this.location$
      .pipe(takeUntil(this.onDestroy), distinctUntilChanged())
      .subscribe((location: LocationData) => {
        this.location = location;
        if (!location) {
          this.getLocation();
        }
      });

    this.locationFailure$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocationFailure)
    );

    this.locationFailure$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((locationFailure: string) => {
        this.locationFailure = locationFailure;
      });

    this.locationTimeReceived$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocationTimeReceived)
    );

    this.locationTimeReceived$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((locationTimeReceived: Date) => {
        this.locationTimeReceived = locationTimeReceived;
      });

    this.loadingLocation$ = this.store$.pipe(
      select(UserStoreSelectors.selectLoadingLocation)
    );

    this.loadingLocation$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loadingLocation: boolean) => {
        this.loadingLocation = loadingLocation;
        if (this.loadingLocation) {
          this.showLocationIndicator$ = timer(500)
            .pipe(
              mapTo(true),
              takeWhile((_) => this.loadingLocation)
            )
            .pipe(startWith(false));
        }
      });

    // Posts
    this.posts$ = this.store$.pipe(select(PostsStoreSelectors.selectPosts));

    this.posts$.pipe(takeUntil(this.onDestroy)).subscribe((posts: Post[]) => {
      this.posts = posts;
      this.loadedPosts = posts.length;
      if (this.posts.length !== 0) {
        this.initialLoad = false;
      }

      if (this.bottom) {
        const bounding = this.bottom.nativeElement.getBoundingClientRect();
        if (
          bounding.top >= 0 &&
          bounding.left >= 0 &&
          bounding.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
          bounding.right <=
            (window.innerWidth || document.documentElement.clientWidth)
        ) {
          this.onScroll();
        }
      }
    });

    this.loading$ = this.store$.pipe(select(PostsStoreSelectors.selectLoading));

    this.loading$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loading: boolean) => {
        this.loading = loading;
        this.showPostsIndicator$ = concat(
          timer(500)
            .pipe(
              mapTo(true),
              takeWhile((_) => this.loading)
            )
            .pipe(startWith(false)),
          of(true)
        );
      });

    this.noPosts$ = this.store$.pipe(select(PostsStoreSelectors.selectNoPosts));

    this.noPosts$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((noPosts: boolean) => {
        this.noPosts = noPosts;
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  offClickHandler(event: MouseEvent): void {
    if (
      this.mobileDropdownLocation &&
      !this.mobileDropdownLocation.nativeElement.contains(event.target)
    ) {
      this.dropdownLocation(false);
    }
    if (
      this.mobileDropdownSort &&
      !this.mobileDropdownSort.nativeElement.contains(event.target)
    ) {
      this.dropdownSort(false);
    }
  }

  dropdownLocation(value: boolean): void {
    this.dropdownLocationEnabled = value;
  }

  dropdownSort(value: boolean): void {
    this.dropdownSortEnabled = value;
  }

  onScroll(): void {
    if (this.noPosts) {
      return;
    }

    let minutesSinceLocation = 0;
    if (this.locationTimeReceived) {
      minutesSinceLocation =
        (new Date().getTime() - this.locationTimeReceived.getTime()) / 1000;
    }
    // check if we need to get location, or if location is outdated
    if (
      !this.loadingLocation &&
      (!this.location ||
        minutesSinceLocation > LOCATIONS_CONSTANTS.VALID_LOCATION_TIME)
    ) {
      this.getLocation();
    }

    // Wait until we have the required info to load posts
    // only local requires location
    // If location is loading, we should wait for it

    const source = interval(500);
    source
      .pipe(
        skipWhile(
          () =>
            typeof this.locationType === 'undefined' ||
            typeof this.searchType === 'undefined' ||
            (this.location === null &&
              this.locationType === LocationType.LOCAL) ||
            (this.loadingLocation === true && this.bypassLocation === false)
        ),
        take(1),
        takeUntil(this.stop$)
      )
      .subscribe(() => {
        this.loadPosts();
      });
  }

  loadPosts(): void {
    // don't load if we are already loading
    if (!this.loading) {
      // TODO: Change to before/after cursors
      // if sorting by new, just need date
      // if sorting by hot, need offset

      if (this.searchType === SearchType.NEW) {
        // use date
        const request: LoadPostRequest = {
          limit: POSTS_CONSTANTS.INITIAL_LIMIT,
          date: this.initialLoad
            ? new Date().toString()
            : this.posts.length > 0
            ? this.posts.slice(-1).pop().creation_date
            : new Date().toString(),
          initialLoad: this.initialLoad,
          location: this.location,
          filter: { location: this.locationType, sort: this.searchType }
        };

        this.store$.dispatch(new PostsStoreActions.LoadRequestAction(request));
      } else if (this.searchType === SearchType.HOT) {
        // use offset
        const request: LoadPostRequest = {
          offset: this.loadedPosts,
          limit: POSTS_CONSTANTS.INITIAL_LIMIT,
          initialLoad: this.initialLoad,
          location: this.location,
          filter: { location: this.locationType, sort: this.searchType }
        };

        this.store$.dispatch(new PostsStoreActions.LoadRequestAction(request));

        this.loadedPosts += POSTS_CONSTANTS.INITIAL_LIMIT;
      }

      this.initialLoad = false;
    }
  }

  refresh(): void {
    // Cancel previous calls
    this.stop$.next();
    this.noPosts = false;
    this.loadedPosts = 0;
    this.initialLoad = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.onScroll();
  }

  setGlobal(): void {
    this.locationType = LocationType.GLOBAL;

    if (this.user.role !== UserRole.GUEST) {
      const request: UpdateUserMetadataRequest = {
        locationType: LocationType.GLOBAL
      };

      this.store$.dispatch(
        new UserActions.UpdateUserMetadataRequestAction(request)
      );
    }

    this.dropdownLocationEnabled = false;

    this.refresh();
  }

  setLocal(): void {
    this.bypassLocation = false;

    this.locationType = LocationType.LOCAL;

    if (this.user.role !== UserRole.GUEST) {
      const request: UpdateUserMetadataRequest = {
        locationType: LocationType.LOCAL
      };

      this.store$.dispatch(
        new UserActions.UpdateUserMetadataRequestAction(request)
      );
    }

    this.dropdownLocationEnabled = false;

    this.refresh();
  }

  isSelectedLocation(location: LocationType): boolean {
    return this.locationType === location;
  }

  setNew(): void {
    this.searchType = SearchType.NEW;

    if (this.user.role !== UserRole.GUEST) {
      const request: UpdateUserMetadataRequest = {
        searchType: SearchType.NEW
      };

      this.store$.dispatch(
        new UserActions.UpdateUserMetadataRequestAction(request)
      );
    }

    this.dropdownSortEnabled = false;

    this.refresh();
  }

  setHot(): void {
    this.searchType = SearchType.HOT;

    if (this.user.role !== UserRole.GUEST) {
      const request: UpdateUserMetadataRequest = {
        searchType: SearchType.HOT
      };

      this.store$.dispatch(
        new UserActions.UpdateUserMetadataRequestAction(request)
      );
    }

    this.dropdownSortEnabled = false;

    this.refresh();
  }

  isSelectedPostSort(postSort: SearchType): boolean {
    return this.searchType === postSort;
  }

  verifyUser(): void {
    const request: VerifyRequest = {};
    this.store$.dispatch(new UserActions.VerifyRequestAction(request));
    this.verificationSent = true;
  }

  loadLocationBackground(): void {
    this.locationType = LocationType.GLOBAL;
    // the location is actually still loading, we just say in this component we arent worried about it anymore
    // So onScroll() posts are loaded
    this.bypassLocation = true;
  }

  askLocationPermission(): void {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permission: PermissionStatus) => {
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
            // the permissions api isnt implemented in this browser so setup to prompt again
            const locationFailure: LocationFailure = {
              error: 'browser'
            };
            this.store$.dispatch(
              new UserActions.LocationFailureAction(locationFailure)
            );
          }
        });
    } else {
      // the permissions api isnt implemented in this browser so setup to prompt again
      const locationFailure: LocationFailure = {
        error: 'browser'
      };
      this.store$.dispatch(
        new UserActions.LocationFailureAction(locationFailure)
      );
    }
  }

  getLocation(): void {
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
          } else if (permission.state === 'prompt') {
            const locationFailure: LocationFailure = {
              error: 'prompt'
            };
            this.store$.dispatch(
              new UserActions.LocationFailureAction(locationFailure)
            );
          } else {
            const locationFailure: LocationFailure = {
              error: 'general'
            };
            this.store$.dispatch(
              new UserActions.LocationFailureAction(locationFailure)
            );
          }
        });
    } else {
      // the permissions api isnt implemented in this browser so setup to prompt again
      const locationFailure: LocationFailure = {
        error: 'browser'
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

  continueWithGlobal(): void {
    this.locationType = LocationType.GLOBAL;

    if (this.user.role !== UserRole.GUEST) {
      const request: UpdateUserMetadataRequest = {
        locationType: LocationType.GLOBAL
      };

      this.store$.dispatch(
        new UserActions.UpdateUserMetadataRequestAction(request)
      );
    }
    // the location is actually still loading, we just say in this component we arent worried about it anymore
    // So onScroll() posts are loaded
    this.bypassLocation = true;
  }
}
