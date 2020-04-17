import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { STRINGS } from '@assets/strings/en';
import { PostsService } from '@services/posts.service';
import { CommentService } from '@services/comments.service';
import { ActivityPostRequest, ActivityPostSuccess, Post } from '@models/posts';
import { ActivityCommentRequest, ActivityCommentSuccess, Comment } from '@models/comments';

@Component({
  selector: 'spot-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {

  STRINGS = STRINGS.MAIN.ACTIVITY;

  constructor( private postsService: PostsService, private commentService: CommentService ) { }

  postActivity$: Observable<Post[]>;
  commentActivity$: Observable<Comment[]>;

  ngOnInit() {

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

}
