import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import {
  mapTo,
  skipWhile,
  startWith,
  take,
  takeUntil,
  takeWhile
} from 'rxjs/operators';
import { Observable, Subject, interval, throwError, timer } from 'rxjs';

// store
import { RootStoreState } from '@store';
import {
  UserActions,
  UserStoreSelectors
} from '@src/app/root-store/user-store';
import { CommentStoreActions } from '@src/app/root-store/comment-store';
import { Store, select } from '@ngrx/store';

// services
import { SpotService } from '@src/app/services/spot.service';
import { AuthenticationService } from '@services/authentication.service';

// models
import {
  GetSingleSpotRequest,
  GetSingleSpotResponse,
  Spot
} from '@models/spot';
import {
  LoadLocationRequest,
  LocationData,
  LocationFailure,
  SetLocationRequest
} from '@models/location';
import { ClearCommentsRequest } from '@models/comment';

@Component({
  selector: 'spot-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private spotService: SpotService,
    private authenticationService: AuthenticationService,
    private store$: Store<RootStoreState.State>
  ) {}

  commentLink: string;
  spotLink: string;

  spot: Spot;
  loadingSpot: boolean;
  showLoadingIndicator$: Observable<boolean>;

  authenticated$: Observable<boolean>;
  location$: Observable<LocationData>;
  location: LocationData;
  loadingLocation$: Observable<boolean>;
  loadingLocation: boolean;
  locationFailure$: Observable<string>;
  locationFailure: string;
  bypassLocation = false;

  error = false;

  ngOnInit(): void {
    // Location
    this.location$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocation)
    );

    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: LocationData) => {
        this.location = location;
      });

    this.loadingLocation$ = this.store$.pipe(
      select(UserStoreSelectors.selectLoadingLocation)
    );

    this.loadingLocation$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loadingLocation: boolean) => {
        this.loadingLocation = loadingLocation;
      });

    this.locationFailure$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocationFailure)
    );

    this.locationFailure$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((locationFailure: string) => {
        this.locationFailure = locationFailure;
        if (locationFailure) {
          this.bypassLocation = true;
        }
      });

    // params
    this.route.paramMap.pipe(takeUntil(this.onDestroy)).subscribe((p: any) => {
      this.commentLink = p.get('commentLink');
      this.spotLink = p.get('spotLink');
    });

    // Authenication
    this.authenticated$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsAuthenticated)
    );

    // reload if user becomes authenticated, skip if we are waiting for store to say authenticated first try
    this.authenticated$
      .pipe(
        takeUntil(this.onDestroy),
        skipWhile((val) => {
          return this.authenticationService.isAuthenticated() && !val;
        })
      )
      .subscribe((authenticated: boolean) => {
        this.waitForSpot();
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  getLocation(): void {
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
              this.bypassLocation = false;
              this.waitForSpot();
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

  private locationError(error: { message: string; code: number }): void {
    const locationFailure: LocationFailure = {
      error: error.code === 1 ? 'permission' : 'general'
    };
    this.store$.dispatch(
      new UserActions.LocationFailureAction(locationFailure)
    );
  }

  skipLocation(): void {
    this.bypassLocation = true;
    this.loadingLocation = false;
  }

  waitForSpot(): void {
    this.loadingSpot = true;
    this.showLoadingIndicator$ = timer(2000)
      .pipe(
        mapTo(true),
        takeWhile((_) => this.loadingSpot)
      )
      .pipe(startWith(false));

    // wait for location and param map to load
    const source = interval(500);
    source
      .pipe(
        skipWhile(
          () =>
            typeof this.spotLink === 'undefined' ||
            (this.location === null && this.bypassLocation === false)
        ),
        take(1)
      )
      .subscribe(() => {
        this.loadSpot();
      });
  }

  loadSpot(): void {
    // load the spot
    const request: GetSingleSpotRequest = {
      spotLink: this.spotLink,
      location: this.location
    };

    this.spotService
      .getSingleSpot(request)
      .pipe(take(1))
      .subscribe(
        (response: GetSingleSpotResponse) => {
          this.error = false;
          this.loadingSpot = false;

          const clearCommentsRequest: ClearCommentsRequest = {
            spotId: response.spot.spotId
          };
          this.store$.dispatch(
            new CommentStoreActions.ClearCommentsRequestAction(
              clearCommentsRequest
            )
          );

          if (this.commentLink) {
            response.spot.startCommentLink = this.commentLink;
          }
          this.spot = response.spot;
        },
        (errorResponse: any) => {
          this.error = true;
          this.loadingSpot = false;
          return throwError(errorResponse.error);
        }
      );
  }

  getSpotLink(spot: Spot): string {
    return window.location.origin + '/spot/' + spot.link;
  }
}
