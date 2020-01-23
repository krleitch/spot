import { Component, OnInit, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { STRINGS } from '@assets/strings/en';
import { RootStoreState } from '@store';
import { CommentsStoreSelectors, CommentsStoreActions } from '@store/comments-store';
import { LoadCommentsRequest, AddCommentRequest, Comment } from '@models/comments';

@Component({
  selector: 'spot-comments-container',
  templateUrl: './comments-container.component.html',
  styleUrls: ['./comments-container.component.scss']
})
export class CommentsContainerComponent implements OnInit {

  @Input() postId: string;
  comments$: Observable<Comment[]>;

  STRINGS = STRINGS.MAIN.COMMENTS_CONTAINER;

  form: FormGroup;

  constructor(private fb: FormBuilder,
              private store$: Store<RootStoreState.State>) {
    this.form = this.fb.group({
      comment: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.comments$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectMyFeatureComments, { postId: this.postId })
    );

    const request: LoadCommentsRequest = {
      postId: this.postId
    };
    this.store$.dispatch(
      new CommentsStoreActions.GetRequestAction(request)
    );
  }

  addComment(content: string) {

    const val = this.form.value;

    if (val.comment) {
      const request: AddCommentRequest = {
        postId: this.postId,
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
