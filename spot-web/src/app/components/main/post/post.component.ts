import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';

import { RootStoreState } from '@store';
import { PostsStoreActions } from '@store/posts-store';
import { LikePostRequest, DislikePostRequest } from '@models/posts';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  STRINGS = STRINGS.MAIN.POST;

  expanded = false;
  timeMessage: string;

  @Input() post: any;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {
    this.getTime(this.post.creation_date);
  }

  getTime(date) {
    const curTime = new Date();
    const postTime = new Date(date);
    const timeDiff = curTime.getTime() - postTime.getTime();
    if (timeDiff < 60000) {
      const secDiff = Math.round(timeDiff / 1000);
      if (secDiff === 0) {
        this.timeMessage = 'Now';
      } else {
        this.timeMessage = secDiff + 's';
      }
    } else if (timeDiff < 3600000) {
      const minDiff = Math.round(timeDiff / 60000);
      this.timeMessage = minDiff + 'm';
    } else if (timeDiff < 86400000) {
      const hourDiff = Math.round(timeDiff / 3600000);
      this.timeMessage = hourDiff + 'h';
    } else if (timeDiff < 31536000000) {
      const dayDiff = Math.round(timeDiff / 86400000);
      this.timeMessage = dayDiff + 'd';
    } else {
      const yearDiff = Math.round(timeDiff / 31536000000);
      this.timeMessage = yearDiff + 'y';
    }
  }

  like() {
    const request: LikePostRequest = {
      id: this.post.id
    };
    this.store$.dispatch(
      new PostsStoreActions.LikeRequestAction(request)
    );

  }

  dislike() {
    const request: DislikePostRequest = {
      id: this.post.id
    };
    this.store$.dispatch(
      new PostsStoreActions.DislikeRequestAction(request)
    );
  }

  setExpanded(value: boolean) {
    this.expanded = value;
  }

}
