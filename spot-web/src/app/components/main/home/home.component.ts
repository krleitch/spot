import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { RootStoreState } from '@store';
import { PostsStoreActions, PostsStoreSelectors } from '@store/posts-store';
import { Post } from '@models/posts';

@Component({
  selector: 'spot-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  posts$: Observable<Post[]>;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {
    this.posts$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeaturePosts)
    );

    // Load all posts
    this.store$.dispatch(
      new PostsStoreActions.LoadRequestAction()
    );
  }

}
