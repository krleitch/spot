import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { PostsStoreActions, PostsStoreSelectors } from '@store/posts-store';
import { AccountsStoreSelectors, AccountsActions } from '@store/accounts-store';
import { Post, LoadPostRequest } from '@models/posts';
import { SetLocationRequest, Location } from '@models/accounts';
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

  postlocation = 'global';
  location$: Observable<Location>;
  myLocation: Location;

  postSort = 'new';

  loadedPosts = 0;
  POSTS_LIMIT = 5;

  // keep track of whether the initial load was made
  // needed so the infinite scroll doesnt get called right away to overwrite
  initialLoad = false;

  locationEnabled = false;

  ngOnInit() {

    this.getAccountLocation();

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLocation)
    );

    this.location$.subscribe( (location: Location) => {
      this.myLocation = location;

      // don't load unless we have a location
      if (location === null) {
        return;
      }

      // Loads the initial posts
      const request: LoadPostRequest = {
        offset: this.loadedPosts,
        limit: this.POSTS_LIMIT,
        location: this.myLocation,
        filter: { location: this.postlocation, sort: this.postSort }
      };

      // Load POSTS_LIMIT posts
      this.store$.dispatch(
        new PostsStoreActions.LoadRequestAction(request)
      );

      this.loadedPosts += this.POSTS_LIMIT;

      this.posts$ = this.store$.pipe(
        select(PostsStoreSelectors.selectMyFeaturePosts)
      );

      this.posts$.subscribe( elem => {
        this.initialLoad = elem.length !== 0;
      });

    });

    this.loading$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeatureLoading)
    );

  }

  onScroll() {

    if ( this.initialLoad ) {

      const request: LoadPostRequest = {
        offset: this.loadedPosts,
        limit: this.POSTS_LIMIT,
        location: this.myLocation,
        filter: { location: this.postlocation, sort: this.postSort }
      };

      // Load POSTS_LIMIT posts
      this.store$.dispatch(
        new PostsStoreActions.LoadRequestAction(request)
      );

      this.loadedPosts += this.POSTS_LIMIT;
    }

  }

  refresh() {

  }

  getAccountLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const request: SetLocationRequest = {
          location: { longitude: position.coords.longitude, latitude: position.coords.latitude }
        };
        this.store$.dispatch(
          new AccountsActions.SetLocationAction(request)
        );
        this.locationEnabled = true;
      }, this.showError.bind(this));
    } else {
      // browser doesnt support location
      this.locationEnabled = false;
    }
  }

  showError(error) {
    // error.code of error.PERMISSION_DENIED, error.POSITION_UNAVAILABLE, error.TIMEOUT
    // hide the content
    this.locationEnabled = false;
  }

  setGlobal() {
    this.postlocation = 'global';
    this.refresh();
  }

  setLocal() {
    this.postlocation = 'local';
    this.refresh();
  }

  isSelectedLocation(location) {
    return this.postlocation === location;
  }

  setNew() {
    this.postSort = 'new';
    this.refresh();
  }

  setHot() {
    this.postSort = 'hot';
    this.refresh();
  }

  isSelectedPostSort(postSort) {
    return this.postSort === postSort;
  }

}
