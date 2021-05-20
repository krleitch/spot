import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// rxjs
import { map, takeUntil, skipWhile, take, mapTo, takeWhile, startWith } from 'rxjs/operators';
import { Observable, Subject, throwError, interval, timer } from 'rxjs';

// store
import { RootStoreState } from '@store';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { CommentsStoreActions } from '@store/comments-store';
import { select, Store } from '@ngrx/store';

// services
import { PostsService } from '@services/posts.service';

// assets
import { LoadSinglePostRequest, LoadSinglePostSuccess, Post } from '@models/posts';
import { Location } from '@models/accounts';
import { ClearCommentsRequest } from '@models/comments';
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

  commentLink: string;
  postLink: string;

  post: Post;
  loadingPost: boolean;
  showLoadingIndicator$: Observable<boolean>;

  authenticated$: Observable<boolean>;
  location$: Observable<Location>;
  location: Location;

  error = false;

  ngOnInit(): void {

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectLocation)
    );

    this.location$.pipe(takeUntil(this.onDestroy)).subscribe( (location: Location) => {
      this.location = location;
    });

    this.route.paramMap.pipe(takeUntil(this.onDestroy)).subscribe( (p: any) => {
      this.commentLink = p.get('commentLink');
      this.postLink = p.get('postLink');
    });

    this.authenticated$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsAuthenticated)
    );

    // reload if user becomes authenticated
    this.authenticated$.pipe(takeUntil(this.onDestroy)).subscribe( (authenticated: boolean) => {
      this.waitForPosts();
    });

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  waitForPosts(): void {

    this.loadingPost = true;
    this.showLoadingIndicator$ = timer(2000).pipe( mapTo(true), takeWhile( (_) => this.loadingPost )).pipe( startWith(false) );

    // wait for location and param map to load
    const source = interval(500);
    source.pipe(
      skipWhile(() => typeof this.postLink === 'undefined' ||
                      typeof this.location === 'undefined'),
      take(1),
    ).subscribe(() => {
      this.loadPost();
    });

  }

  loadPost(): void {

    // load the post
    const request: LoadSinglePostRequest = {
      postLink: this.postLink,
      location: this.location
    };

    this.postsService.getPost(request).pipe(take(1)).subscribe(( (postSuccess: LoadSinglePostSuccess) =>  {
        this.error = false;
        this.loadingPost = false;

        const clearCommentsRequest: ClearCommentsRequest = {
          postId: postSuccess.post.id
        };
        this.store$.dispatch(
          new CommentsStoreActions.ClearCommentsRequestAction(clearCommentsRequest),
        );

        if ( this.commentLink ) {
          postSuccess.post.startCommentLink = this.commentLink;
        }
        this.post = postSuccess.post;
      }), ( (errorResponse: any) => {
        this.error = true;
        this.loadingPost = false;
        return throwError(errorResponse.error);
      })
    );

  }

  getPostLink(post: Post): string {
    return window.location.origin + '/posts/' + post.link;
  }

}
