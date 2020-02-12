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

  loadedPosts = 0;
  POSTS_LIMIT = 5;

  ngOnInit() {

    this.getAccountLocation();

    this.posts$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeaturePosts)
    );

    this.loading$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeatureLoading)
    );

  }

  onScroll() {

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

  getAccountLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const request: SetLocationRequest = {
          location: { longitude: position.coords.longitude, latitude: position.coords.latitude }
        };
        console.log(request);
        this.store$.dispatch(
          new AccountsActions.SetLocationAction(request)
        );
      }, this.showError);
    }
  }

  showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log('User denied the request for Geolocation.');
        break;
      case error.POSITION_UNAVAILABLE:
        console.log('Location information is unavailable.');
        break;
      case error.TIMEOUT:
        console.log('The request to get user location timed out.');
        break;
    }
  }

  setGlobal() {
    this.location = 'global';
  }

  setLocal() {
    this.location = 'local';
  }

  isSelected(location) {
    return this.location === location;
  }

}
