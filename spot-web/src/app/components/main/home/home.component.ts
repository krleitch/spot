import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { PostsStoreActions, PostsStoreSelectors } from '@store/posts-store';
import { AccountsStoreSelectors, AccountsActions } from '@store/accounts-store';
import { Post, LoadPostRequest, LoadPostSuccess } from '@models/posts';
import { SetLocationRequest, Location, UpdateAccountMetadataRequest, AccountMetadata } from '@models/accounts';
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  posts$: Observable<Post[]>;
  loading$: Observable<boolean>;

  STRINGS = STRINGS.MAIN.HOME;

  constructor(private store$: Store<RootStoreState.State>) { }

  postlocation = '';
  location$: Observable<Location>;
  myLocation: Location;

  accountMetadata$: Observable<AccountMetadata>;

  postSort = '';

  loadedPosts = 0;
  POSTS_LIMIT = 10;

  // keep track of whether the initial load was made
  // needed so the infinite scroll doesnt get called right away to overwrite
  initialLoad = true;

  locationEnabled = false;

  mobile = false;

  ngOnInit() {

    if (window.innerWidth < 500) {
      this.mobile = true;
    }

    this.accountMetadata$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountMetadata)
    );

    this.accountMetadata$.subscribe( (metadata: AccountMetadata) => {

      if ( metadata ) {

        this.postlocation = metadata.search_distance;
        this.postSort = metadata.search_type;

      }

    });

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLocation)
    );

    this.location$.subscribe( (location: Location) => {
      this.myLocation = location;

      // don't load unless we have a location
      if (location === null) {
        this.locationEnabled = false;
        return;
      } else {
        this.locationEnabled = true;
      }

      // Loads the initial posts
      // const request: LoadPostRequest = {
      //   offset: this.loadedPosts,
      //   limit: this.POSTS_LIMIT,
      //   location: this.myLocation,
      //   filter: { location: this.postlocation, sort: this.postSort }
      // };

      // // Load POSTS_LIMIT posts
      // this.store$.dispatch(
      //   new PostsStoreActions.LoadRequestAction(request)
      // );

      // this.loadedPosts += this.POSTS_LIMIT;

      // this.posts$.subscribe( elem => {
      //   this.initialLoad = elem.length !== 0;
      // });

    });

    this.posts$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeaturePosts)
    );

    this.loading$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeatureLoading)
    );

  }

  onScroll() {

    if ( this.locationEnabled && this.postlocation && this.postSort ) {

      const request: LoadPostRequest = {
        offset: this.loadedPosts,
        limit: this.POSTS_LIMIT,
        date: new Date().toString(),
        initialLoad: this.initialLoad,
        location: this.myLocation,
        filter: { location: this.postlocation, sort: this.postSort }
      };


      this.store$.dispatch(
        new PostsStoreActions.LoadRequestAction(request)
      );

      this.initialLoad = false;

      this.loadedPosts += this.POSTS_LIMIT;

    }

  }

  refresh() {

    this.loadedPosts = 0;

    this.initialLoad = true;

    // Loads the initial posts
    const request: LoadPostRequest = {
      offset: this.loadedPosts,
      limit: this.POSTS_LIMIT,
      location: this.myLocation,
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

  setGlobal() {
    this.postlocation = 'global';

    const request: UpdateAccountMetadataRequest = {
      search_distance: 'global'
    };

    this.store$.dispatch(
      new AccountsActions.UpdateAccountMetadataRequestAction(request)
    );

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

    this.refresh();
  }

  isSelectedPostSort(postSort) {
    return this.postSort === postSort;
  }

}
