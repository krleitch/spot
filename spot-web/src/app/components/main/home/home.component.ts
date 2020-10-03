import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, timer, merge, combineLatest } from 'rxjs';
import { takeUntil, mapTo, finalize, startWith, distinctUntilChanged, skipWhile, skip, take } from 'rxjs/operators';

import { RootStoreState } from '@store';
import { PostsStoreActions, PostsStoreSelectors } from '@store/posts-store';
import { AccountsStoreSelectors, AccountsActions } from '@store/accounts-store';
import { Post, LoadPostRequest, LoadPostSuccess } from '@models/posts';
import { SetLocationRequest, Location, UpdateAccountMetadataRequest, AccountMetadata, Account, VerifyRequest } from '@models/accounts';
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  posts$: Observable<Post[]>;
  showPostsIndicator$: Observable<boolean>;
  loading$: Observable<boolean>;
  loading: boolean;
  postsLoadedOnce = false;

  STRINGS = STRINGS.MAIN.HOME;

  loadingLocation$: Observable<boolean>;
  location$: Observable<Location>;
  location: Location = null;

  account$: Observable<Account>;
  accountMetadata$: Observable<AccountMetadata>;

  noPosts$: Observable<boolean>;

  postlocation = '';
  postSort = '';
  distanceUnit = '';

  loadedPosts = 0;
  POSTS_LIMIT = 10;

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
        this.postlocation = metadata.search_distance;
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

    this.location$.pipe(takeUntil(this.onDestroy)).subscribe( (location: Location) => {
      this.location = location;
    });

    // Posts and are the posts loading
    this.posts$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeaturePosts)
    );

    this.showPostsIndicator$ = merge(
      timer(1000).pipe( mapTo(true), takeUntil(this.posts$.pipe(skipWhile( (v) => !v.length ))) ),
      combineLatest(this.posts$.pipe(skipWhile( (v) => !v.length )), timer(2000)).pipe( mapTo(false) ),
    ).pipe(
      startWith(false),
      distinctUntilChanged(),
    );

    this.loading$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeatureLoading)
    );

    this.loading$.pipe(takeUntil(this.onDestroy)).subscribe( (loading: boolean) => {
      this.loading = loading;
    });

    this.noPosts$ = this.store$.pipe(
      select(PostsStoreSelectors.selectNoPosts)
    );

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

    if ( this.postlocation && this.postSort && !this.loading ) {

      // global doesnt require location
      if ( this.location || this.postlocation === 'global' ) {

        const request: LoadPostRequest = {
          offset: this.loadedPosts,
          limit: this.POSTS_LIMIT,
          date: new Date().toString(),
          initialLoad: this.initialLoad,
          location: this.location,
          filter: { location: this.postlocation, sort: this.postSort }
        };

        this.store$.dispatch(
          new PostsStoreActions.LoadRequestAction(request)
        );

        this.initialLoad = false;
        this.loadedPosts += this.POSTS_LIMIT;

      }
    }
  }

  refresh() {

    this.loadedPosts = 0;

    this.initialLoad = true;

    if ( this.location || this.postlocation === 'global' ) {

      // Loads the initial posts
      const request: LoadPostRequest = {
        offset: this.loadedPosts,
        limit: this.POSTS_LIMIT,
        location: this.location,
        date: new Date().toString(),
        initialLoad: this.initialLoad,
        filter: { location: this.postlocation, sort: this.postSort }
      };

      // Load POSTS_LIMIT posts
      this.store$.dispatch(
        new PostsStoreActions.LoadRequestAction(request)
      );

      this.initialLoad = false;

      this.loadedPosts += this.POSTS_LIMIT;

    }

  }

  setGlobal() {
    this.postlocation = 'global';

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
    this.postlocation = 'local';

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
    return this.postlocation === location;
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
