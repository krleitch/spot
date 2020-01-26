import { Component, OnInit, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { STRINGS } from '@assets/strings/en';
import { RootStoreState } from '@store';
import { CommentsStoreSelectors, CommentsStoreActions } from '@store/comments-store';
import { LoadCommentsRequest, AddCommentRequest, Comment } from '@models/comments';
import { Post } from '@models/posts';

@Component({
  selector: 'spot-comments-container',
  templateUrl: './comments-container.component.html',
  styleUrls: ['./comments-container.component.scss']
})
export class CommentsContainerComponent implements OnInit {

  @Input() post: Post;
  // fix this type
  comments$: Observable<any>;

  comments = [];
  totalComments = 0;
  numLoaded = 0;

  STRINGS = STRINGS.MAIN.COMMENTS_CONTAINER;

  form: FormGroup;

  currentOffset = 0;

  constructor(private fb: FormBuilder,
              private store$: Store<RootStoreState.State>) {
    this.form = this.fb.group({
      comment: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.comments$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectMyFeatureComments, { postId: this.post.id })
    );

    this.comments$.subscribe( comments => {
      this.comments = comments.comments;
      this.totalComments = comments.totalComments;
    });

    const request: LoadCommentsRequest = {
      postId: this.post.id,
      offset: this.currentOffset,
      limit: 1
    };
    this.store$.dispatch(
      new CommentsStoreActions.GetRequestAction(request)
    );
    this.numLoaded += 1;
    this.currentOffset += 1;
  }

  loadMoreComments() {
    // Load 1 more comments
    const limit = 1;
    const request: LoadCommentsRequest = {
      postId: this.post.id,
      offset: this.currentOffset,
      limit
    };
    this.store$.dispatch(
      new CommentsStoreActions.GetRequestAction(request)
    );
    this.numLoaded += limit;
    this.currentOffset += limit;
  }

  addComment() {
    const val = this.form.value;
    if (val.comment) {
      const request: AddCommentRequest = {
        postId: this.post.id,
        content: val.comment
      };
      this.store$.dispatch(
        new CommentsStoreActions.AddRequestAction(request)
      );
    } else {
      this.form.controls.comment.markAsDirty();
    }
  }

}
