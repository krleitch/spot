import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, Subject, timer } from 'rxjs';
import {
  finalize,
  mapTo,
  startWith,
  take,
  takeUntil,
  takeWhile
} from 'rxjs/operators';

// store
import { RootStoreState } from '@store';
import { Store, select } from '@ngrx/store';
import { UserStoreSelectors } from '@src/app/root-store/user-store';

// services
import { PostsService } from '@services/posts.service';
import { CommentService } from '@services/comments.service';

// assets
import { ActivityPostRequest, ActivityPostSuccess, Post } from '@models/posts';
import {
  ActivityCommentRequest,
  ActivityCommentSuccess,
  CommentActivity
} from '@models/comments';
import { UserMetadata, UnitSystem } from '@models/../newModels/userMetadata';
import { LocationData } from '@models/../newModels/location';

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

  location$: Observable<LocationData>;
  location: LocationData;

  userMetadata$: Observable<UserMetadata>;
  userMetadata: UserMetadata;

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

  constructor(
    private store$: Store<RootStoreState.State>,
    private postsService: PostsService,
    private commentService: CommentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.location$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocation)
    );

    this.userMetadata$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserMetadata)
    );

    this.userMetadata$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((userMetadata: UserMetadata) => {
        this.userMetadata = userMetadata;
      });

    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: LocationData) => {
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
      return secDiff + (secDiff === 1 ? ' second' : ' seconds');
    } else if (timeDiff < 3600000) {
      const minDiff = Math.round(timeDiff / 60000);
      return minDiff + (minDiff === 1 ? ' minute' : ' minutes');
    } else if (timeDiff < 86400000) {
      const hourDiff = Math.round(timeDiff / 3600000);
      return hourDiff + (hourDiff === 1 ? ' hour' : ' hours');
    } else if (timeDiff < 31536000000) {
      const dayDiff = Math.round(timeDiff / 86400000);
      return dayDiff + (dayDiff === 1 ? ' day' : ' days');
    } else {
      const yearDiff = Math.round(timeDiff / 31536000000);
      return yearDiff + (yearDiff === 1 ? ' year' : ' years');
    }
  }

  getDistance(distance: number, unit: UnitSystem): string {
    if (unit === UnitSystem.METRIC) {
      return (distance * 1.60934).toFixed(1) + ' km';
    } else {
      return distance.toFixed(1) + ' m';
    }
  }

  onScrollComments(): void {
    if (!this.commentActivityLoading) {
      const activityCommentRequest: ActivityCommentRequest = {
        limit: this.postLimit,
        after: this.commentsAfter
      };

      this.commentActivityLoading = true;

      const comments$ = this.commentService
        .getActivity(activityCommentRequest)
        .pipe(
          take(1),
          finalize(() => {
            this.commentActivityLoading = false;
            this.commentsLoadedOnce = true;
          })
        );

      this.showCommentsIndicator$ = timer(500)
        .pipe(
          mapTo(true),
          takeWhile((val) => this.commentActivityLoading)
        )
        .pipe(startWith(false));

      comments$.subscribe((activitySuccess: ActivityCommentSuccess) => {
        const activities: CommentActivityActivity[] =
          activitySuccess.activity.map((activity) => ({
            ...activity,
            imageBlurred: true
          }));
        this.commentActivity = this.commentActivity.concat(activities);
        if (activitySuccess.cursor.after) {
          this.commentsAfter = activitySuccess.cursor.after;
        }
      });
    }
  }

  onScrollPost(): void {
    if (!this.postActivityLoading) {
      const activityPostRequest: ActivityPostRequest = {
        limit: this.postLimit,
        location: this.location,
        after: this.postAfter
      };

      this.postActivityLoading = true;

      const posts$ = this.postsService.getActivity(activityPostRequest).pipe(
        take(1),
        finalize(() => {
          this.postActivityLoading = false;
          this.postsLoadedOnce = true;
        })
      );

      this.showPostsIndicator$ = timer(500)
        .pipe(
          mapTo(true),
          takeWhile((val) => this.postActivityLoading)
        )
        .pipe(startWith(false));

      posts$.subscribe((activitySuccess: ActivityPostSuccess) => {
        const activities: PostActivity[] = activitySuccess.activity.map(
          (activity) => ({ ...activity, imageBlurred: activity.image_nsfw })
        );
        // const activities: PostActivity[] = activitySuccess.activity.map(activity => ({ ...activity, imageBlurred: true }))
        this.postActivity = this.postActivity.concat(activities);
        if (activitySuccess.cursor.after) {
          this.postAfter = activitySuccess.cursor.after;
        }
      });
    }
  }

  activityClicked(activity): void {
    activity.imageBlurred = false;
  }
}
