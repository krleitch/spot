import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, timer, interval } from 'rxjs';
import { takeUntil, mapTo, startWith, skipWhile, takeWhile, take } from 'rxjs/operators';

import { RootStoreState } from '@store';
import { PostsStoreActions, PostsStoreSelectors } from '@store/posts-store';
import { AccountsStoreSelectors, AccountsActions } from '@store/accounts-store';
import { Post, LoadPostRequest } from '@models/posts';
import { Location, UpdateAccountMetadataRequest, AccountMetadata, Account, VerifyRequest } from '@models/accounts';
import { STRINGS } from '@assets/strings/en';
import { POSTS_CONSTANTS } from '@constants/posts';

@Component({
  selector: 'spot-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  posts$: Observable<Post[]>;
  posts: Post[];
  showPostsIndicator$: Observable<boolean>;
  loading$: Observable<boolean>;
  loading: boolean;
  noPosts$: Observable<boolean>;
  noPosts: boolean;

  STRINGS = STRINGS.MAIN.HOME;
  POSTS_CONSTANTS = POSTS_CONSTANTS;

  loadingLocation$: Observable<boolean>;
  loadingLocation: boolean;
  location$: Observable<Location>;
  location: Location = null;
  showLocationIndicator$: Observable<boolean>;

  account$: Observable<Account>;
  accountMetadata$: Observable<AccountMetadata>;

  postLocation: string = undefined;
  postSort: string = undefined;
  distanceUnit = '';

  loadedPosts = 0;

  // keep track of whether the initial load was made
  // needed so the infinite scroll doesnt get called right away to overwrite
  initialLoad = true;

  verificationSent = false;

  @ViewChild('mobileDropdownLocation') mobileDropdownLocation: ElementRef;
  dropdownLocationEnabled = false;
  @ViewChild('mobileDropdownSort') mobileDropdownSort: ElementRef;
  dropdownSortEnabled = false;

  constructor(private store$: Store<RootStoreState.State>) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit() {

    this.accountMetadata$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountMetadata)
    );

    this.account$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsUser)
    );

    this.accountMetadata$.pipe(takeUntil(this.onDestroy)).subscribe( (metadata: AccountMetadata) => {
      if ( metadata ) {
        this.postLocation = metadata.search_distance;
        this.postSort = metadata.search_type;
        this.distanceUnit = metadata.distance_unit;
      }
    });

    // Difference between location loading and disabled
    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLocation)
    );

    this.loadingLocation$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLoadingLocation)
    );

    this.loadingLocation$.pipe(takeUntil(this.onDestroy)).subscribe( (loadingLocation: boolean) => {
      this.loadingLocation = loadingLocation;
      if ( this.loadingLocation ) {
        this.showLocationIndicator$ = timer(500).pipe( mapTo(true), takeWhile( (_) => this.loadingLocation )).pipe( startWith(false) );
      }
    });

    this.location$.pipe(takeUntil(this.onDestroy)).subscribe( (location: Location) => {
      this.location = location;
    });

    // Posts and are the posts loading
    this.posts$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeaturePosts)
    );

    this.posts$.pipe(takeUntil(this.onDestroy)).subscribe( (posts: Post[]) => {
      this.posts = posts;
    });

    this.loading$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeatureLoading)
    );

    this.loading$.pipe(takeUntil(this.onDestroy)).subscribe( (loading: boolean) => {
      this.loading = loading;
      if ( this.loading ) {
        this.showPostsIndicator$ = timer(500).pipe( mapTo(true), takeWhile( (_) => this.loading )).pipe( startWith(false) );
      }
    });

    this.noPosts$ = this.store$.pipe(
      select(PostsStoreSelectors.selectNoPosts)
    );

    this.noPosts$.pipe(takeUntil(this.onDestroy)).subscribe( (noPosts: boolean) => {
      this.noPosts = noPosts;
    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  offClickHandler(event: MouseEvent) {
    if (this.mobileDropdownLocation && !this.mobileDropdownLocation.nativeElement.contains(event.target)) {
      this.dropdownLocation(false);
    }
    if (this.mobileDropdownSort && !this.mobileDropdownSort.nativeElement.contains(event.target)) {
      this.dropdownSort(false);
    }
  }

  dropdownLocation(value: boolean) {
    this.dropdownLocationEnabled = value;
  }

  dropdownSort(value: boolean) {
    this.dropdownSortEnabled = value;
  }

  onScroll() {

    // wait until we have the required info to load posts
    // only local requires location
    const source = interval(500);
    source.pipe(
      skipWhile(() => typeof this.postLocation === 'undefined' ||
                      typeof this.postSort === 'undefined' ||
                      (typeof this.location === 'undefined' && this.postLocation === 'local')),
      take(1)
    ).subscribe(() => {
      this.loadPosts();
    });

  }

  loadPosts() {

    // don't load if we are already loading
    if ( !this.loading ) {

      // if sorting by new, just need date
      // if sorting by hot, need offset

      if ( this.postSort === 'new' ) {
        // use date
        const request: LoadPostRequest = {
          limit: POSTS_CONSTANTS.INITIAL_LIMIT,
          date: this.posts.length > 0 ? this.posts.slice(-1).pop().creation_date : new Date().toString(),
          initialLoad: this.initialLoad,
          location: this.location,
          filter: { location: this.postLocation, sort: this.postSort }
        };

        this.store$.dispatch(
          new PostsStoreActions.LoadRequestAction(request)
        );

      } else if ( this.postSort === 'hot' ) {
        // use offset
        const request: LoadPostRequest = {
          offset: this.loadedPosts,
          limit: POSTS_CONSTANTS.INITIAL_LIMIT,
          initialLoad: this.initialLoad,
          location: this.location,
          filter: { location: this.postLocation, sort: this.postSort }
        };

        this.store$.dispatch(
          new PostsStoreActions.LoadRequestAction(request)
        );

        this.loadedPosts += POSTS_CONSTANTS.INITIAL_LIMIT;

      }

      this.initialLoad = false;

    }
  }

  refresh() {

    this.loadedPosts = 0;
    this.initialLoad = true;
    this.loadPosts();

  }

  setGlobal() {
    this.postLocation = 'global';

    const request: UpdateAccountMetadataRequest = {
      search_distance: 'global'
    };

    this.store$.dispatch(
      new AccountsActions.UpdateAccountMetadataRequestAction(request)
    );

    this.dropdownLocationEnabled = false;

    this.refresh();
  }

  setLocal() {
    this.postLocation = 'local';

    const request: UpdateAccountMetadataRequest = {
      search_distance: 'local'
    };

    this.store$.dispatch(
      new AccountsActions.UpdateAccountMetadataRequestAction(request)
    );

    this.dropdownLocationEnabled = false;

    this.refresh();
  }

  isSelectedLocation(location) {
    return this.postLocation === location;
  }

  setNew() {
    this.postSort = 'new';

    const request: UpdateAccountMetadataRequest = {
      search_type: 'new'
    };

    this.store$.dispatch(
      new AccountsActions.UpdateAccountMetadataRequestAction(request)
    );

    this.dropdownSortEnabled = false;

    this.refresh();
  }

  setHot() {
    this.postSort = 'hot';

    const request: UpdateAccountMetadataRequest = {
      search_type: 'hot'
    };

    this.store$.dispatch(
      new AccountsActions.UpdateAccountMetadataRequestAction(request)
    );

    this.dropdownSortEnabled = false;

    this.refresh();
  }

  isSelectedPostSort(postSort) {
    return this.postSort === postSort;
  }

  verifyAccount() {
    const request: VerifyRequest = {};
    this.store$.dispatch(
      new AccountsActions.VerifyRequestAction(request)
    );
    this.verificationSent = true;
  }

}
