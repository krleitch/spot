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
import { AccountsActions, AccountsStoreSelectors } from '@store/accounts-store';
import { CommentsStoreActions } from '@store/comments-store';
import { Store, select } from '@ngrx/store';

// services
import { PostsService } from '@services/posts.service';
import { AuthenticationService } from '@services/authentication.service';

// assets
import {
  LoadSinglePostRequest,
  LoadSinglePostSuccess,
  Post
} from '@models/posts';
import {
  LoadLocationRequest,
  Location,
  LocationFailure,
  SetLocationRequest
} from '@models/accounts';
import { ClearCommentsRequest } from '@models/comments';
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private postsService: PostsService,
    private authenticationService: AuthenticationService,
    private store$: Store<RootStoreState.State>
  ) {}

  STRINGS = STRINGS.MAIN.POST_DETAILED;

  commentLink: string;
  postLink: string;

  post: Post;
  loadingPost: boolean;
  showLoadingIndicator$: Observable<boolean>;

  authenticated$: Observable<boolean>;
  location$: Observable<Location>;
  location: Location;
  loadingLocation$: Observable<boolean>;
  loadingLocation: boolean;
  locationFailure$: Observable<string>;
  locationFailure: string;
  bypassLocation = false;

  error = false;

  ngOnInit(): void {
    // Location
    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectLocation)
    );

    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: Location) => {
        this.location = location;
      });

    this.loadingLocation$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectLoadingLocation)
    );

    this.loadingLocation$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loadingLocation: boolean) => {
        this.loadingLocation = loadingLocation;
      });

    this.locationFailure$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectLocationFailure)
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
      this.postLink = p.get('postLink');
    });

    // Authenication
    this.authenticated$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsAuthenticated)
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
        this.waitForPosts();
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
              new AccountsActions.LoadLocationAction(loadLocationRequest)
            );

            navigator.geolocation.getCurrentPosition((position) => {
              const setLocationRequest: SetLocationRequest = {
                location: {
                  longitude: position.coords.longitude,
                  latitude: position.coords.latitude
                }
              };
              this.store$.dispatch(
                new AccountsActions.SetLocationAction(setLocationRequest)
              );
              this.bypassLocation = false;
              this.waitForPosts();
            }, this.locationError.bind(this));
          } else {
            // the permissions api isnt implemented in this browser so setup to prompt again
            const locationFailure: LocationFailure = {
              error: 'browser'
            };
            this.store$.dispatch(
              new AccountsActions.LocationFailureAction(locationFailure)
            );
          }
        });
    } else {
      // the permissions api isnt implemented in this browser so setup to prompt again
      const locationFailure: LocationFailure = {
        error: 'browser'
      };
      this.store$.dispatch(
        new AccountsActions.LocationFailureAction(locationFailure)
      );
    }
  }

  private locationError(error: { message: string; code: number }): void {
    const locationFailure: LocationFailure = {
      error: error.code === 1 ? 'permission' : 'general'
    };
    this.store$.dispatch(
      new AccountsActions.LocationFailureAction(locationFailure)
    );
  }

  skipLocation(): void {
    this.bypassLocation = true;
    this.loadingLocation = false;
  }

  waitForPosts(): void {
    this.loadingPost = true;
    this.showLoadingIndicator$ = timer(2000)
      .pipe(
        mapTo(true),
        takeWhile((_) => this.loadingPost)
      )
      .pipe(startWith(false));

    // wait for location and param map to load
    const source = interval(500);
    source
      .pipe(
        skipWhile(
          () =>
            typeof this.postLink === 'undefined' ||
            (this.location === null && this.bypassLocation === false)
        ),
        take(1)
      )
      .subscribe(() => {
        this.loadPost();
      });
  }

  loadPost(): void {
    // load the post
    const request: LoadSinglePostRequest = {
      postLink: this.postLink,
      location: this.location
    };

    this.postsService
      .getPost(request)
      .pipe(take(1))
      .subscribe(
        (postSuccess: LoadSinglePostSuccess) => {
          this.error = false;
          this.loadingPost = false;

          const clearCommentsRequest: ClearCommentsRequest = {
            postId: postSuccess.post.id
          };
          this.store$.dispatch(
            new CommentsStoreActions.ClearCommentsRequestAction(
              clearCommentsRequest
            )
          );

          if (this.commentLink) {
            postSuccess.post.startCommentLink = this.commentLink;
          }
          this.post = postSuccess.post;
        },
        (errorResponse: any) => {
          this.error = true;
          this.loadingPost = false;
          return throwError(errorResponse.error);
        }
      );
  }

  getPostLink(post: Post): string {
    return window.location.origin + '/posts/' + post.link;
  }
}
