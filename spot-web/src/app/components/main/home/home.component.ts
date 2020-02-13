import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { PostsStoreActions, PostsStoreSelectors } from '@store/posts-store';
import { AccountsActions } from '@store/accounts-store';
import { Post, LoadPostRequest } from '@models/posts';
import { SetLocationRequest } from '@models/accounts';
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

  location = 'global';

  postFilter = 'new';

  loadedPosts = 0;
  POSTS_LIMIT = 5;

  // keep track of whether the initial load was made
  // needed so the infinite scroll doesnt get called right away to overwrite
  initialLoad = false;

  locationEnabled = false;

  ngOnInit() {

    this.getAccountLocation();

    // Loads the initial posts
    const request: LoadPostRequest = {
      offset: this.loadedPosts,
      limit: this.POSTS_LIMIT
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

    this.loading$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeatureLoading)
    );

  }

  onScroll() {

    if ( this.initialLoad ) {

      const request: LoadPostRequest = {
        offset: this.loadedPosts,
        limit: this.POSTS_LIMIT
      };

      // Load POSTS_LIMIT posts
      this.store$.dispatch(
        new PostsStoreActions.LoadRequestAction(request)
      );

      this.loadedPosts += this.POSTS_LIMIT;
    }

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
    this.location = 'global';
  }

  setLocal() {
    this.location = 'local';
  }

  isSelectedLocation(location) {
    return this.location === location;
  }

  setNew() {
    this.postFilter = 'new';
  }

  setHot() {
    this.postFilter = 'hot';
  }

  isSelectedPostFilter(postfilter) {
    return this.postFilter === postfilter;
  }

}
