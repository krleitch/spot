import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

import { RootStoreState } from '@store';
import { CommentsStoreSelectors, CommentsStoreActions } from '@store/comments-store';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { STRINGS } from '@assets/strings/en';
import { Comment, DeleteCommentRequest, AddReplyRequest, LoadRepliesRequest,
         LikeCommentRequest, DislikeCommentRequest } from '@models/comments';
import { CommentService } from '@services/comments.service';
import { ModalService } from '@services/modal.service';
import { Tag } from '@models/notifications';
import { COMMENTS_CONSTANTS } from '@constants/comments';

@Component({
  selector: 'spot-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input() detailed: boolean;
  @Input() inRange: boolean;
  @Input() comment: Comment;
  @Input() postLink: string;

  @ViewChild('options') options;
  @ViewChild('text') text;

  STRINGS = STRINGS.MAIN.COMMENTS;
  COMMENTS_CONSTANTS = COMMENTS_CONSTANTS;

  // For large comments
  expanded = false;
  isExpandable = false;

  @ViewChild('tag') tag: ElementRef;
  tags: Tag[] = [];
  showTag = false;
  tagName = '';

  replyText: string;

  // fix this type
  replies$: Observable<any>;

  isAuthenticated$: Observable<boolean>;

  replies = [];
  totalReplies = 0;
  numLoaded = 0;

  FILENAME_MAX_SIZE = 25;
  imageFile: File;
  imgSrc: string = null;

  // distplaying used characters for add comment
  MAX_COMMENT_LENGTH = 300;
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

    this.replies$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectMyFeatureReplies, { postId: this.comment.post_id, commentId: this.comment.id })
    );

    this.isAuthenticated$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsAuthenticated)
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
      initialLimit = 5;
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

    if ( this.comment.content.split(/\r\n|\r|\n/).length > COMMENTS_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH
         || this.comment.content.length > COMMENTS_CONSTANTS.MAX_TRUNCATE_LENGTH ) {
      this.isExpandable = true;
    }

    console.log(this.comment.content);
    console.log(this.isExpandable);

    this.setContentHTML();

  }

  setContentHTML() {

    // we need to add tags in asc order of their offset
    // this.comment.tag.tags.sort( (a: any, b: any) => {
    //   return a.offset < b.offset ? 1 : 0;
    // });

    const content = this.getContent();
    const div = document.createElement('div');
    let lastOffset = 0;

    // Tags list must be sorted in ASC order of offset,
    // Server should ensure this
    if ( this.comment.tag.tags.length > 0 ) {

      this.comment.tag.tags.forEach( (tag: any) => {

        // plus one if its at very end
        if ( tag.offset <= content.length + 1 ) {

          const span = document.createElement('span');
          const before = document.createTextNode(content.substring(lastOffset, Math.min(tag.offset, content.length + 1)));
          const t = document.createElement('span');
          t.className = 'tag-inline';
          const name = document.createTextNode(tag.username ? tag.username : '???');
          t.appendChild(name);
          // const after = document.createTextNode(content.substring(tag.offset));
          span.appendChild(before);
          span.appendChild(t);
          // span.appendChild(after);
          lastOffset = Math.min(tag.offset, content.length + 1);

          div.appendChild(span);

        } else {

          // need to still have rest of text with no tag
          const after = document.createTextNode(content.substring(lastOffset));
          div.appendChild(after);

        }

      });

    } else {

      const cc = document.createTextNode(content);
      div.appendChild(cc);

    }

    if ( this.isExpandable && ! this.expanded ) {
      const cc = document.createTextNode(' ...');
      div.appendChild(cc);
    }

    this.text.nativeElement.innerHTML = div.innerHTML;

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

    this.replyText = event.target.textContent;
    this.currentLength = this.replyText.length;

    const words = this.replyText.split(' ');
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

    // tag.id = this.tags.length;
    // this.tags.push(tag);

    // const words = this.replyText.split(' ');
    // words.pop();
    // this.replyText = words.join(' ');

  }

  removeTag(id: number) {

    // this.tags.forEach( (tag: Tag, index: number) => {
    //   if ( tag.id === id ) {
    //     this.tags.splice(index, 1);
    //   }
    // });

  }

  getContent(): string {

    if ( this.expanded || !this.isExpandable ) {
      return this.comment.content;
    }

    const textArrays = this.comment.content.split(/\r\n|\r|\n/);
    let truncatedContent = '';

    for (let i = 0; i < textArrays.length && i < COMMENTS_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH; i++ ) {

      if ( truncatedContent.length + textArrays[i].length > COMMENTS_CONSTANTS.MAX_TRUNCATE_LENGTH ) {
        truncatedContent = textArrays[i].substring(0, COMMENTS_CONSTANTS.MAX_TRUNCATE_LENGTH - truncatedContent.length);
        break;
      } else {
        truncatedContent += textArrays[i];
        // Dont add newline for last line or last line before line length reached
        if ( i !== textArrays.length - 1 && i !== COMMENTS_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH - 1) {
          truncatedContent += '\n';
        }
      }

    }

    return truncatedContent + ' ...';

  }

  setExpanded(value: boolean) {
    this.expanded = value;
    this.setContentHTML();
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

    this.modalService.open('spot-confirm-modal');

    const result$ = this.modalService.getResult('spot-confirm-modal').pipe(take(1));

    result$.subscribe( (result: { status: string }) => {

      if ( result.status === 'confirm' ) {

        const request: DeleteCommentRequest = {
          postId: this.comment.post_id,
          commentId: this.comment.id
        };
        this.store$.dispatch(
          new CommentsStoreActions.DeleteRequestAction(request)
        );

      }

    });

  }

  setShowAddReply(val: boolean) {
    this.showAddReply = val;
  }

  addReply() {

    const content = this.replyText;

    if (content.length <= this.MAX_COMMENT_LENGTH) {
      const request: AddReplyRequest = {
        postId: this.comment.post_id,
        commentId: this.comment.id,
        content,
        image: this.imageFile,
        tagsList: this.tags
      };

      this.store$.dispatch(
        new CommentsStoreActions.AddReplyRequestAction(request)
      );

      this.replyText = '';
      this.imageFile = null;
      this.setShowAddReply(false);

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

  invalidLength(): boolean {
    return this.currentLength > this.MAX_COMMENT_LENGTH;
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

  openModal(id: string, data?: any) {

    if ( data ) {
      this.modalService.open(id, data);
    } else {
      this.modalService.open(id);
    }

  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

}
