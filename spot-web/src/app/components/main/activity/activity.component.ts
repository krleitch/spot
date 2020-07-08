import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { STRINGS } from '@assets/strings/en';
import { RootStoreState } from '@store';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { PostsService } from '@services/posts.service';
import { CommentService } from '@services/comments.service';
import { ActivityPostRequest, ActivityPostSuccess, Post } from '@models/posts';
import { ActivityCommentRequest, ActivityCommentSuccess, CommentActivity } from '@models/comments';
import { Location, AccountMetadata } from '@models/accounts';

@Component({
  selector: 'spot-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  STRINGS = STRINGS.MAIN.ACTIVITY;

  location$: Observable<Location>;
  myLocation: Location;

  accountMetadata$: Observable<AccountMetadata>;

  selectedTab = 'posts';

  constructor( private store$: Store<RootStoreState.State>, private postsService: PostsService,
               private commentService: CommentService, private router: Router ) { }

  postActivity$: Observable<Post[]>;
  commentActivity$: Observable<CommentActivity[]>;

  postLimit = 10;
  postLastDate = null;
  commentLimit = 10;
  commentLastDate = null;

  ngOnInit() {

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLocation)
    );

    this.accountMetadata$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountMetadata)
    );

    this.location$.pipe(takeUntil(this.onDestroy)).subscribe( (location: Location) => {

      this.myLocation = location;

      const activityPostRequest: ActivityPostRequest = {
        date: new Date().toString(),
        limit: this.postLimit,
        location: this.myLocation
      };

      this.postActivity$ = this.postsService.getActivity( activityPostRequest ).pipe(
        map( (activitySuccess: ActivityPostSuccess ) => {
          this.postLastDate = activitySuccess.activity.slice(-1)[0].creation_date;
          return activitySuccess.activity;
        })
      );

      const activityCommentRequest: ActivityCommentRequest = {
        date: new Date().toString(),
        limit: this.postLimit
      };

      this.commentActivity$ = this.commentService.getActivity( activityCommentRequest ).pipe(
        map( (activitySuccess: ActivityCommentSuccess ) => {
          this.commentLastDate = activitySuccess.activity.slice(-1)[0].creation_date;
          return activitySuccess.activity;
        })
      );

    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  setTab(tab: string) {
    this.selectedTab = tab;
  }

  formatDate(date: string) {
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

  getDistance(distance: number, unit: string) {
    if ( unit === 'kilometers' ) {
      return (distance * 1.60934).toFixed(1) + ' km';
    } else {
      return distance.toFixed(1) + ' m';
    }
  }

  openPost( link: string ) {
    this.router.navigateByUrl(/posts/ + link);
  }

  openComment( postLink: string, commentlink: string ) {
    this.router.navigateByUrl(/posts/ + postLink + '/comments/' + commentlink);
  }

  onScroll() {

    // TODO

    if ( this.selectedTab === 'posts' ) {

    } else {

    }

  }

}
