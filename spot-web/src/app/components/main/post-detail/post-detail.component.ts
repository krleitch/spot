import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, takeUntil, catchError, skipWhile, take, mapTo, takeWhile, startWith } from 'rxjs/operators';
import { Observable, Subject, throwError, interval, timer } from 'rxjs';
import { select, Store } from '@ngrx/store';

import { RootStoreState } from '@store';
import { PostsService } from '@services/posts.service';
import { LoadSinglePostRequest, Post } from '@models/posts';
import { Location } from '@models/accounts';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private postsService: PostsService,
              private store$: Store<RootStoreState.State>) { }

  STRINGS = STRINGS.MAIN.POST_DETAILED;

  commentId: string;
  postId: string;

  post$: Observable<Post>;
  loadingPost: boolean;
  showLoadingIndicator$: Observable<boolean>;

  authenticated$: Observable<boolean>;
  location$: Observable<Location>;
  location: Location;

  error = false;

  ngOnInit() {

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectLocation)
    );

    this.location$.pipe(takeUntil(this.onDestroy)).subscribe( (location: Location) => {
      this.location = location;
    });

    this.route.paramMap.pipe(takeUntil(this.onDestroy)).subscribe( (p: any) => {
      this.commentId = p.get('commentId');
      this.postId = p.get('postId');

    });

    this.authenticated$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsAuthenticated)
    );

    // reload if user becomes authenticated
    this.authenticated$.pipe(takeUntil(this.onDestroy)).subscribe( (authenticated: boolean) => {
      if ( authenticated ) {
        this.waitForPosts();
      }
    });

    this.waitForPosts();

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  waitForPosts() {

    this.loadingPost = true;
    this.showLoadingIndicator$ = timer(2000).pipe( mapTo(true), takeWhile( (_) => this.loadingPost )).pipe( startWith(false) );

    // wait for location and param map to load
    const source = interval(500);
    source.pipe(
      skipWhile(() => typeof this.postId === 'undefined' ||
                      typeof this.location === 'undefined'),
      take(1),
    ).subscribe(() => {
      this.loadPost();
    });

  }

  loadPost() {

    // load the post
    const request: LoadSinglePostRequest = {
      postLink: this.postId,
      location: this.location
    };

    this.post$ = this.postsService.getPost(request).pipe(
      map( postSuccess =>  {
        this.error = false;
        this.loadingPost = false;
        if ( this.commentId ) {
          postSuccess.post.startCommentId = this.commentId;
        }
        return postSuccess.post;
      }),
      catchError( (errorResponse: any) => {
        this.error = true;
        this.loadingPost = false;
        return throwError(errorResponse.error);
      }),
    );
  }

  getPostLink(post: Post) {
    return window.location.origin + '/posts/' + post.link;
  }

}
