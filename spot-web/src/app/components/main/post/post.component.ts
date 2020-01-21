import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';

import { RootStoreState } from '@store';
import { PostsStoreActions } from '@store/posts-store';
import { LikePostRequest, DislikePostRequest, DeletePostRequest, Post } from '@models/posts';

import { STRINGS } from '@assets/strings/en';

@Component({
  selector: 'spot-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {

  @Input() post: Post;
  @ViewChild('options') options;

  STRINGS = STRINGS.MAIN.POST;

  MAX_POST_LENGTH = 300;
  expanded = false;

  timeMessage: string;
  optionsEnabled = false;

  constructor(private store$: Store<RootStoreState.State>) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit() {
    this.getTime(this.post.creation_date);
  }

  offClickHandler(event: MouseEvent) {
    if (!this.options.nativeElement.contains(event.target)) {
      this.setOptions(false);
    }
  }

  setOptions(value) {
    this.optionsEnabled = value;
  }

  deletePost() {
    const request: DeletePostRequest = {
      postId: this.post.id
    };
    this.store$.dispatch(
      new PostsStoreActions.DeleteRequestAction(request)
    );
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

  getContent(): string {
    if (this.expandable() && !this.expanded) {
      return this.post.content.substring(0, this.MAX_POST_LENGTH) + ' ...';
    } else {
      return this.post.content;
    }
  }

  expandable(): boolean {
    return this.post.content.length > this.MAX_POST_LENGTH;
  }

  like() {
    if (this.post.rated !== 1) {
      const request: LikePostRequest = {
        postId: this.post.id
      };
      this.store$.dispatch(
        new PostsStoreActions.LikeRequestAction(request)
      );
    }
  }

  dislike() {
    if (this.post.rated !== 0) {
      const request: DislikePostRequest = {
        postId: this.post.id
      };
      this.store$.dispatch(
        new PostsStoreActions.DislikeRequestAction(request)
      );
    }
  }

  setExpanded(value: boolean) {
    this.expanded = value;
  }

}
