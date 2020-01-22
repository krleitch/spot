import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { PostsStoreActions, PostsStoreSelectors, RootStoreState } from '../../root-store';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  posts$: Observable<any[]>;

  constructor(private store$: Store<RootStoreState.State>) {}

  ngOnInit() {
    this.posts$ = this.store$.pipe(
      select(PostsStoreSelectors.selectMyFeaturePosts)
    );

    this.store$.dispatch(
      new PostsStoreActions.LoadRequestAction()
    );
  }

}
