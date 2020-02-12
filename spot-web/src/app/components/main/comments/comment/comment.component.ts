import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { RootStoreState } from '@store';
import { CommentsStoreSelectors, CommentsStoreActions } from '@store/comments-store';
import { STRINGS } from '@assets/strings/en';
import { Comment, DeleteCommentRequest, AddReplyRequest, LoadRepliesRequest,
         LikeCommentRequest, DislikeCommentRequest } from '@models/comments';
import { CommentService } from '@services/comments.service';

@Component({
  selector: 'spot-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input() detailed: boolean;
  @Input() comment: Comment;
  @ViewChild('options') options;

  STRINGS = STRINGS.MAIN.COMMENTS;

  // Show ... for content
  MAX_SHOW_COMMENT_LENGTH = 100;
  expanded = false;

  // fix this type
  replies$: Observable<any>;

  replies = [];
  totalReplies = 0;
  numLoaded = 0;

  form: FormGroup;

  // displaying used characters for add comment
  MAX_COMMENT_LENGTH = 300;
  currentLength = 0;

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
    this.replies$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectMyFeatureReplies, { postId: this.comment.post_id, commentId: this.comment.id })
    );

    this.replies$.subscribe( replies => {
      this.replies = replies.replies;
      this.totalReplies = replies.totalReplies;
    });

    // if detailed load more replies
    let initialLimit;
    if ( this.detailed ) {
      initialLimit = 10;
    } else {
      initialLimit = 1;
    }

    const request: LoadRepliesRequest = {
      postId: this.comment.post_id,
      commentId: this.comment.id,
      offset: this.currentOffset,
      limit: initialLimit
    };
    this.store$.dispatch(
      new CommentsStoreActions.GetReplyRequestAction(request)
    );
    this.currentOffset += initialLimit;
    // off set and num loaded should be based off array length, not set here, FIX TODO
    this.numLoaded += initialLimit;
    this.getTime(this.comment.creation_date);
  }

  offClickHandler(event: MouseEvent) {
    if (!this.options.nativeElement.contains(event.target)) {
      this.setOptions(false);
    }
  }

  getContent(): string {
    // https://css-tricks.com/line-clampin/
    if (this.expandable() && !this.expanded) {
      return this.comment.content.substring(0, this.MAX_SHOW_COMMENT_LENGTH) + ' ...';
    } else {
      return this.comment.content;
    }
  }

  expandable(): boolean {
    return this.comment.content.length > this.MAX_SHOW_COMMENT_LENGTH;
  }

  setExpanded(value: boolean) {
    this.expanded = value;
  }

  loadMoreReplies() {
    // Load 1 more replys
    const limit = 1;
    const request: LoadRepliesRequest = {
      postId: this.comment.post_id,
      commentId: this.comment.id,
      offset: this.currentOffset,
      limit
    };
    this.store$.dispatch(
      new CommentsStoreActions.GetReplyRequestAction(request)
    );
    this.currentOffset += limit;
    this.numLoaded += limit;
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
      postId: this.comment.post_id,
      commentId: this.comment.id
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

    if (val.comment && val.comment.length <= this.MAX_COMMENT_LENGTH) {
      const request: AddReplyRequest = {
        postId: this.comment.post_id,
        commentId: this.comment.id,
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
    if (this.comment.rated !== 1) {
      const request: LikeCommentRequest = {
        postId: this.comment.post_id,
        commentId: this.comment.id
      };
      this.store$.dispatch(
        new CommentsStoreActions.LikeRequestAction(request)
      );
    }
  }

  dislike() {
    if (this.comment.rated !== 0) {
      const request: DislikeCommentRequest = {
        postId: this.comment.post_id,
        commentId: this.comment.id
      };
      this.store$.dispatch(
        new CommentsStoreActions.DislikeRequestAction(request)
      );
    }
  }

  getProfilePictureClass(index) {
    return this.commentService.getProfilePictureClass(index);
  }

  getProfilePictureSymbol(index) {
    return this.commentService.getProfilePictureSymbol(index);
  }

  onKey(event) {
    this.currentLength = this.form.value.comment.length;
  }

  invalidLength(): boolean {
    return this.currentLength > this.MAX_COMMENT_LENGTH;
  }

}
