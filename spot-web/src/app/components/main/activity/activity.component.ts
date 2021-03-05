import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, Subject, timer } from 'rxjs';
import { takeUntil, take, finalize, mapTo, takeWhile, startWith } from 'rxjs/operators';

// store
import { RootStoreState } from '@store';
import { Store, select } from '@ngrx/store';
import { AccountsStoreSelectors } from '@store/accounts-store';

// services  
import { PostsService } from '@services/posts.service';
import { CommentService } from '@services/comments.service';

// assets
import { ActivityPostRequest, ActivityPostSuccess, Post } from '@models/posts';
import { ActivityCommentRequest, ActivityCommentSuccess, CommentActivity } from '@models/comments';
import { Location, AccountMetadata } from '@models/accounts';
import { STRINGS } from '@assets/strings/en';

// Extend Post and Comment to include acitivty specefic properties
interface PostActivity extends Post {
  imageBlurred: boolean;
}

interface CommentActivityActivity extends CommentActivity {
  imageBlurred: boolean;
}

@Component({
  selector: 'spot-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  STRINGS = STRINGS.MAIN.ACTIVITY;

  location$: Observable<Location>;
  location: Location;

  accountMetadata$: Observable<AccountMetadata>;
  accountMetadata: AccountMetadata;

  selectedTab = 'posts';

  postActivity: PostActivity[] = [];
  postLimit = 10;
  postActivityLoading = false;
  showPostsIndicator$: Observable<boolean>;
  postsLoadedOnce = false;
  postAfter: string = null;

  commentActivity: CommentActivityActivity[] = [];
  commentLimit = 10;
  commentActivityLoading = false;
  showCommentsIndicator$: Observable<boolean>;
  commentsLoadedOnce = false;
  commentsAfter: string = null;

  constructor( private store$: Store<RootStoreState.State>, private postsService: PostsService,
               private commentService: CommentService, private router: Router ) { }

  ngOnInit(): void {

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectLocation)
    );

    this.accountMetadata$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountMetadata)
    );

    this.accountMetadata$.pipe(takeUntil(this.onDestroy)).subscribe( (accountMetadata: AccountMetadata) => {
      this.accountMetadata = accountMetadata;
    });

    this.location$.pipe(takeUntil(this.onDestroy)).subscribe( (location: Location) => {
      this.location = location;
    });

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  setTab(tab: string): void {
    this.selectedTab = tab;
  }

  formatDate(date: string): string {
    const curTime = new Date();
    const postTime = new Date(date);
    const timeDiff = curTime.getTime() - postTime.getTime();
    if (timeDiff < 60000) {
      const secDiff = Math.round(timeDiff / 1000);
      return secDiff + ( secDiff === 1 ? ' second' : ' seconds' );
    } else if (timeDiff < 3600000) {
      const minDiff = Math.round(timeDiff / 60000);
      return minDiff + ( minDiff === 1 ? ' minute' : ' minutes' );
    } else if (timeDiff < 86400000) {
      const hourDiff = Math.round(timeDiff / 3600000);
      return hourDiff + ( hourDiff === 1 ? ' hour' : ' hours' );
    } else if (timeDiff < 31536000000) {
      const dayDiff = Math.round(timeDiff / 86400000);
      return dayDiff + ( dayDiff === 1 ? ' day' : ' days' );
    } else {
      const yearDiff = Math.round(timeDiff / 31536000000);
      return yearDiff + ( yearDiff === 1 ? ' year' : ' years' );
    }
  }

  getDistance(distance: number, unit: string): string {
    if ( unit === 'metric' ) {
      return (distance * 1.60934).toFixed(1) + ' km';
    } else {
      return distance.toFixed(1) + ' m';
    }
  }

  onScrollComments(): void {

    if ( !this.commentActivityLoading ) {

      const activityCommentRequest: ActivityCommentRequest = {
        limit: this.postLimit,
        after: this.commentsAfter
      };

      this.commentActivityLoading = true;

      let comments$ = this.commentService.getActivity( activityCommentRequest ).pipe(
        take(1),
        finalize(() => {
          this.commentActivityLoading = false;
          this.commentsLoadedOnce = true;
        }),
      );

      this.showCommentsIndicator$ = timer(500).pipe( mapTo(true), takeWhile( val => this.commentActivityLoading )).pipe( startWith(false) );

      comments$.subscribe( (activitySuccess: ActivityCommentSuccess ) => {
          const activities: CommentActivityActivity[] = activitySuccess.activity.map(activity => ({ ...activity, imageBlurred: true }))
          this.commentActivity = this.commentActivity.concat(activities);
          if ( activitySuccess.cursor.after ) {
            this.commentsAfter = activitySuccess.cursor.after;
          }
      });

    }

  }

  onScrollPost(): void {

    if ( !this.postActivityLoading ) {

      const activityPostRequest: ActivityPostRequest = {
        limit: this.postLimit,
        location: this.location,
        after: this.postAfter
      };

      this.postActivityLoading = true;

      const posts$ = this.postsService.getActivity( activityPostRequest ).pipe(
        take(1),
        finalize(() => {
          this.postActivityLoading = false;
          this.postsLoadedOnce = true;
        }),
      );

      this.showPostsIndicator$ = timer(500).pipe( mapTo(true), takeWhile( val => this.postActivityLoading )).pipe( startWith(false) );

      posts$.subscribe( (activitySuccess: ActivityPostSuccess ) => {
          // const activities: ActivityPost[] = activitySuccess.activity.map(activity => ({ ...activity, blurred: activity.image_nsfw }))
          const activities: PostActivity[] = activitySuccess.activity.map(activity => ({ ...activity, imageBlurred: true }))
          this.postActivity = this.postActivity.concat(activities);
          if ( activitySuccess.cursor.after ) {
            this.postAfter = activitySuccess.cursor.after;
          }
      });

    }

  }

  activityClicked(activity): void {
    activity.imageBlurred = false;
  }

}
