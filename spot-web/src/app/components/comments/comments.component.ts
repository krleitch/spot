import { Component, OnInit, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { CommentsStoreActions, CommentsStoreSelectors, RootStoreState } from '../../root-store';
import { selectMyFeatureComments } from './../../root-store/comments-store/selectors';

@Component({
  selector: 'spot-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  @Input() postId: string;
  comments$: Observable<Comment[]>;

  expanded: boolean = false;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {
    this.comments$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectMyFeatureComments, { postId: this.postId })
    );

    this.store$.dispatch(
      new CommentsStoreActions.GetRequestAction({ postId: this.postId })
    );
  }

  expand() {
    this.expanded = !this.expanded;
  }

  getMessage() {
    if (this.expanded) {
      return "Hide comments";
    } else {
      return "Show more comments";
    }
  }

  deleteComment(commentId) {
    this.store$.dispatch(
      new CommentsStoreActions.DeleteRequestAction({ commentId: commentId, postId: this.postId })
    );
  }

  getTime(date) {
    const curTime = new Date();
    const postTime = new Date(date);
    const timeDiff = curTime.getTime() - postTime.getTime();
    if (timeDiff < 60000) {
      const secDiff = Math.round(timeDiff/1000);
      return secDiff + " second" + (secDiff == 1 ? "" : "s") +  " ago"
    } else if (timeDiff < 3600000) {
      const minDiff = Math.round(timeDiff/60000);
      return minDiff + " minute"+ (minDiff == 1 ? "" : "s") + " ago";
    } else if (timeDiff < 86400000) {
      const hourDiff = Math.round(timeDiff/3600000);
      return hourDiff + " hour" + (hourDiff == 1 ? "" : "s") + " ago";
    } else {
      return postTime.getMonth() + 1 + "/" + postTime.getDate() + "/" + postTime.getFullYear();
    }
  }

  addComment(content: string) {
    const comment: any = {
      Content: content
    };
    this.store$.dispatch(
      new CommentsStoreActions.AddRequestAction( { postId: this.postId, body: comment })
    );
  }

}
