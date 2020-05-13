import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { DomSanitizer } from '@angular/platform-browser';

import { RootStoreState } from '@store';
import { CommentsStoreActions } from '@store/comments-store';
import { STRINGS } from '@assets/strings/en';
import { Comment, AddReplyRequest, DeleteReplyRequest, LikeReplyRequest,
         DislikeReplyRequest, ReportCommentRequest } from '@models/comments';
import { CommentService } from '@services/comments.service';
import { ModalService } from '@services/modal.service';
import { Tag } from '@models/notifications';

@Component({
  selector: 'spot-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.scss']
})
export class ReplyComponent implements OnInit {

  @Input() detailed: boolean;
  @Input() reply: Comment;
  @Input() postLink: string;
  @ViewChild('options') options;

  @ViewChild('tag') tag: ElementRef;
  tags: Tag[] = [];
  showTag = false;
  tagName = '';

  STRINGS = STRINGS.MAIN.REPLY;

  // Show ... for content
  MAX_SHOW_REPLY_LENGTH = 100;
  expanded = false;

  reply2Text: string;

  FILENAME_MAX_SIZE = 20;
  imageFile: File;
  imgSrc: string = null;

  // displaying used characters for add reply
  MAX_REPLY_LENGTH = 300;
  currentLength = 0;

  timeMessage: string;
  showAddReply = false;
  optionsEnabled = false;

  currentOffset = 0;

  constructor(private store$: Store<RootStoreState.State>,
              private commentService: CommentService,
              public domSanitizer: DomSanitizer,
              private modalService: ModalService) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit() {
    this.getTime(this.reply.creation_date);
  }

  offClickHandler(event: MouseEvent) {
    if (!this.options.nativeElement.contains(event.target)) {
      this.setOptions(false);
    }

    if (!this.tag.nativeElement.contains(event.target)) {
      this.showTag = false;
    }

  }

  onTextInput(event) {

    // TODO: A space should add a tag

    this.reply2Text = event.target.textContent;
    this.currentLength = this.reply2Text.length;

    const words = this.reply2Text.split(' ');
    const lastWord = words[words.length - 1];

    if ( lastWord.length >= 1 ) {

      if ( lastWord[0] === '@' ) {

        this.showTag = true;
        this.tagName = lastWord.substr(1);

      } else {

        this.showTag = false;
        this.tagName = '';

      }

    } else {

      this.showTag = false;
      this.tagName = '';

    }
  }

  addTag(tag: Tag) {

    tag.id = this.tags.length;
    this.tags.push(tag);

    const words = this.reply2Text.split(' ');
    words.pop();
    this.reply2Text = words.join(' ');

  }

  removeTag(id: number) {

    this.tags.forEach( (tag: Tag, index: number) => {
      if ( tag.id === id ) {
        this.tags.splice(index, 1);
      }
    });

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
      return this.reply.content.substring(0, this.MAX_SHOW_REPLY_LENGTH) + ' ...';
    } else {
      return this.reply.content;
    }
  }

  expandable(): boolean {
    return this.reply.content.length > this.MAX_SHOW_REPLY_LENGTH;
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

    const content = this.reply2Text;

    if (content.length <= this.MAX_REPLY_LENGTH) {

      const request: AddReplyRequest = {
        postId: this.reply.post_id,
        commentId: this.reply.parent_id,
        content,
        image: this.imageFile,
        tagsList: this.tags
      };

      this.store$.dispatch(
        new CommentsStoreActions.AddReplyRequestAction(request)
      );

      this.reply2Text = '';
      this.imageFile = null;
      this.setShowAddReply(false);

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

  invalidLength(): boolean {
    return this.currentLength > this.MAX_REPLY_LENGTH;
  }

  onFileChanged(event) {
    this.imageFile = event.target.files[0];
    this.imgSrc = window.URL.createObjectURL(this.imageFile);
  }

  removeFile() {
    this.imageFile = null;
    this.imgSrc = null;
  }

  getDisplayFilename(name: string) {
    if (name.length > this.FILENAME_MAX_SIZE) {
      return name.substr(0, this.FILENAME_MAX_SIZE) + '...';
    } else {
      return name;
    }
  }

  // TODO: for comments and replies want to add id to modal id's so unique

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

}
