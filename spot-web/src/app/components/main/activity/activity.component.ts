import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { STRINGS } from '@assets/strings/en';
import { RootStoreState } from '@store';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { PostsService } from '@services/posts.service';
import { CommentService } from '@services/comments.service';
import { ActivityPostRequest, ActivityPostSuccess, Post } from '@models/posts';
import { ActivityCommentRequest, ActivityCommentSuccess, Comment } from '@models/comments';
import { Location } from '@models/accounts';

@Component({
  selector: 'spot-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {

  STRINGS = STRINGS.MAIN.ACTIVITY;

  location$: Observable<Location>;
  myLocation: Location;

  selectedTab = 'posts';

  constructor( private store$: Store<RootStoreState.State>, private postsService: PostsService,
               private commentService: CommentService, private router: Router ) { }

  postActivity$: Observable<Post[]>;
  commentActivity$: Observable<Comment[]>;

  ngOnInit() {

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLocation)
    );

    this.location$.subscribe( (location: Location) => {
      this.myLocation = location;
    });

    // TODO: these should move

    const activityPostRequest: ActivityPostRequest = {
      offset: 0,
      limit: 10
    };

    this.postActivity$ = this.postsService.getActivity( activityPostRequest ).pipe(
      map( (activitySuccess: ActivityPostSuccess ) => {
        return activitySuccess.activity;
      })
    );

    const activityCommentRequest: ActivityCommentRequest = {
      offset: 0,
      limit: 10
    };

    this.commentActivity$ = this.commentService.getActivity( activityCommentRequest ).pipe(
      map( (activitySuccess: ActivityCommentSuccess ) => {
        return activitySuccess.activity;
      })
    );

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

  getDistance( latitude: number, longitude: number ) {
    return this.postsService.calcDistance(latitude, longitude, this.myLocation.latitude,
                                           this.myLocation.longitude, 'M').toFixed(1) + ' miles';
  }

  openPost( link: string ) {
    this.router.navigateByUrl(/posts/ + link);
  }

}
