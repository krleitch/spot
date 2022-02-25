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
import { SpotService } from '@src/app/services/spot.service';
import { CommentService } from '@services/comments.service';

// assets
import {
  GetSpotActivityRequest,
  GetSpotActivityResponse,
  Spot
} from '@models/../newModels/spot';
import {
  ActivityCommentRequest,
  ActivityCommentSuccess,
  CommentActivity
} from '@models/comments';
import { UserMetadata, UnitSystem } from '@models/../newModels/userMetadata';
import { LocationData } from '@models/../newModels/location';

// Extend Spot and Comment to include acitivty specefic properties
interface SpotActivity extends Spot {
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

  selectedTab = 'spots';

  spotActivity: SpotActivity[] = [];
  spotLimit = 10;
  spotActivityLoading = false;
  showSpotsIndicator$: Observable<boolean>;
  spotsLoadedOnce = false;
  spotAfter: Date = null;

  commentActivity: CommentActivityActivity[] = [];
  commentLimit = 10;
  commentActivityLoading = false;
  showCommentsIndicator$: Observable<boolean>;
  commentsLoadedOnce = false;
  commentsAfter: string = null;

  constructor(
    private store$: Store<RootStoreState.State>,
    private spotService: SpotService,
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
    const spotTime = new Date(date);
    const timeDiff = curTime.getTime() - spotTime.getTime();
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
        limit: this.spotLimit,
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

  onScrollSpot(): void {
    if (!this.spotActivityLoading) {
      const activitySpotRequest: GetSpotActivityRequest = {
        limit: this.spotLimit,
        location: this.location,
        after: this.spotAfter
      };

      this.spotActivityLoading = true;

      const spots$ = this.spotService.getSpotActivity(activitySpotRequest).pipe(
        take(1),
        finalize(() => {
          this.spotActivityLoading = false;
          this.spotsLoadedOnce = true;
        })
      );

      this.showSpotsIndicator$ = timer(500)
        .pipe(
          mapTo(true),
          takeWhile((val) => this.spotActivityLoading)
        )
        .pipe(startWith(false));

      spots$.subscribe((response: GetSpotActivityResponse) => {
        const activities: SpotActivity[] = response.activity.map(
          (activity) => ({ ...activity, imageBlurred: activity.imageNsfw })
        );
        // const activities: SpotActivity[] = activitySuccess.activity.map(activity => ({ ...activity, imageBlurred: true }))
        this.spotActivity = this.spotActivity.concat(activities);
        if (response.cursor.after) {
          this.spotAfter = response.cursor.after;
        }
      });
    }
  }

  activityClicked(activity): void {
    activity.imageBlurred = false;
  }
}
