import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, takeUntil, catchError } from 'rxjs/operators';
import { Observable, Subject, throwError } from 'rxjs';
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

  post$: Observable<Post>;

  isAuthenticated$: Observable<boolean>
  location$: Observable<Location>;
  myLocation: Location;
  locationEnabled = false;

  error = false;

  commentId: string;

  ngOnInit() {

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLocation)
    );

    this.location$.pipe(takeUntil(this.onDestroy)).subscribe( (location: Location) => {
      this.myLocation = location;

      this.route.paramMap.subscribe( p => {

        this.commentId = p.get('commentId');

        const request: LoadSinglePostRequest = {
          postLink: p.get('postId'),
          location: this.myLocation
        };

        this.post$ = this.postsService.getPost(request).pipe(
          map( postSuccess =>  {
            this.error = false;
            if ( this.commentId ) {
              postSuccess.post.startCommentId = this.commentId;
            }
            return postSuccess.post;
          }),
          catchError( (errorResponse: any) => {
            this.error = true;
            return throwError(errorResponse.error);
          })
        );

      });

    });

    this.isAuthenticated$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsAuthenticated)
    );

    // reload if user becomes authenticated
    this.isAuthenticated$.pipe(takeUntil(this.onDestroy)).subscribe( (isAuthenticated: boolean) => {

      console.log(isAuthenticated)

      if ( isAuthenticated ) {

        this.route.paramMap.subscribe( p => {

          this.commentId = p.get('commentId');

          const request: LoadSinglePostRequest = {
            postLink: p.get('postId'),
            location: this.myLocation
          };

          this.post$ = this.postsService.getPost(request).pipe(
            map( postSuccess =>  {
              this.error = false;
              if ( this.commentId ) {
                postSuccess.post.startCommentId = this.commentId;
              }
              return postSuccess.post;
            }),
            catchError( (errorResponse: any) => {
              this.error = true;
              return throwError(errorResponse.error);
            })
          );

        });

      }

    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  getPostLink(post: Post) {
    return window.location.origin + '/posts/' + post.link;
  }

}
