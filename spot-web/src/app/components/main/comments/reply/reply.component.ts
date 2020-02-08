import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RootStoreState } from '@store';
import { CommentsStoreActions } from '@store/comments-store';
import { STRINGS } from '@assets/strings/en';
import { Comment, AddReplyRequest, DeleteReplyRequest, LikeReplyRequest, DislikeReplyRequest } from '@models/comments';
import { CommentService } from '@services/comments.service';

@Component({
  selector: 'spot-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.scss']
})
export class ReplyComponent implements OnInit {

  @Input() reply: Comment;
  @ViewChild('options') options;

  STRINGS = STRINGS.MAIN.REPLY;

  // Show ... for content
  MAX_REPLY_LENGTH = 100;
  expanded = false;

  form: FormGroup;

  timeMessage: string;
  showAddReply = false;
  optionsEnabled = false;

  currentOffset = 0;

  constructor(private fb: FormBuilder,
              private store$: Store<RootStoreState.State>,
              private commentService: CommentService) {
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

  getContent(): string {
    // https://css-tricks.com/line-clampin/
    if (this.expandable() && !this.expanded) {
      return this.reply.content.substring(0, this.MAX_REPLY_LENGTH) + ' ...';
    } else {
      return this.reply.content;
    }
  }

  expandable(): boolean {
    return this.reply.content.length > this.MAX_REPLY_LENGTH;
  }

  setExpanded(value: boolean) {
    this.expanded = value;
  }

  deleteReply() {
    const request: DeleteReplyRequest = {
      postId: this.reply.post_id,
      parentId: this.reply.parent_id,
      commentId: this.reply.id
    };
    this.store$.dispatch(
      new CommentsStoreActions.DeleteReplyRequestAction(request)
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
        commentId: this.reply.parent_id,
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
    if (this.reply.rated !== 1) {
      const request: LikeReplyRequest = {
        postId: this.reply.post_id,
        parentId: this.reply.parent_id,
        commentId: this.reply.id
      };
      this.store$.dispatch(
        new CommentsStoreActions.LikeReplyRequestAction(request)
      );
    }
  }

  dislike() {
    if (this.reply.rated !== 0) {
      const request: DislikeReplyRequest = {
        postId: this.reply.post_id,
        parentId: this.reply.parent_id,
        commentId: this.reply.id
      };
      this.store$.dispatch(
        new CommentsStoreActions.DislikeReplyRequestAction(request)
      );
    }
  }

  getProfilePictureClass(index) {
    return this.commentService.getProfilePictureClass(index);
  }

  getProfilePictureSymbol(index) {
    return this.commentService.getProfilePictureSymbol(index);
  }

}
