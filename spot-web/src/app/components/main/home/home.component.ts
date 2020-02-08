import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { PostsStoreActions, PostsStoreSelectors } from '@store/posts-store';
import { Post, LoadPostRequest } from '@models/posts';

@Component({
  selector: 'spot-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  posts$: Observable<Post[]>;

  constructor(private store$: Store<RootStoreState.State>) { }

  loadedPosts = 0;
  POSTS_LIMIT = 5;

  ngOnInit() {

    this.posts$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeaturePosts)
    );

    // const request: LoadPostRequest = {
    //   offset: 0,
    //   limit: this.POSTS_LIMIT
    // };

    // // Load POSTS_LIMIT posts
    // this.store$.dispatch(
    //   new PostsStoreActions.LoadRequestAction(request)
    // );

    // this.loadedPosts += this.POSTS_LIMIT;

  }

  onScroll() {

    // TODO:
    // ADD IS ISLOADING, ADD HOW MANY WERE ACTUALLY FETCHED

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
