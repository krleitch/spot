import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RootStoreState } from '@store';
import { CommentsStoreActions } from '@store/comments-store';
import { STRINGS } from '@assets/strings/en';
import { Comment, AddReplyRequest, DeleteCommentRequest } from '@models/comments';

@Component({
  selector: 'spot-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.scss']
})
export class ReplyComponent implements OnInit {

  @Input() reply: Comment;
  @ViewChild('options') options;

  STRINGS = STRINGS.MAIN.REPLY;

  form: FormGroup;

  timeMessage: string;
  showAddReply = false;
  optionsEnabled = false;

  currentOffset = 0;

  constructor(private fb: FormBuilder,
              private store$: Store<RootStoreState.State>) {
    document.addEventListener('click', this.offClickHandler.bind(this));
    this.form = this.fb.group({
      comment: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getTime(this.reply.creation_date);
  }

  offClickHandler(event: MouseEvent) {
    if (!this.options.nativeElement.contains(event.target)) {
      this.setOptions(false);
    }
  }

  setOptions(value) {
    this.optionsEnabled = value;
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

  deleteComment() {
    const request: DeleteCommentRequest = {
      postId: this.reply.post_id,
      commentId: this.reply.id
    };
    this.store$.dispatch(
      new CommentsStoreActions.DeleteRequestAction(request)
    );
  }

  setShowAddReply(val: boolean) {
    this.showAddReply = val;
  }

  addReply() {

    const val = this.form.value;

    if (val.comment) {
      const request: AddReplyRequest = {
        postId: this.reply.post_id,
        commentId: this.reply.id,
        content: val.comment
      };
      this.store$.dispatch(
        new CommentsStoreActions.AddReplyRequestAction(request)
      );
    } else {
      this.form.controls.comment.markAsDirty();
    }
  }

  like() {

  }

  dislike() {

  }

}
