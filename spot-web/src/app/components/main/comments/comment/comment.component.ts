import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

import { RootStoreState } from '@store';
import { CommentsStoreSelectors, CommentsStoreActions } from '@store/comments-store';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { SocialStoreSelectors } from '@store/social-store';
import { STRINGS } from '@assets/strings/en';
import { Comment, DeleteCommentRequest, AddReplyRequest, LoadRepliesRequest,
         LikeCommentRequest, DislikeCommentRequest } from '@models/comments';
import { CommentService } from '@services/comments.service';
import { ModalService } from '@services/modal.service';
import { AlertService } from '@services/alert.service';
import { Tag } from '@models/notifications';
import { COMMENTS_CONSTANTS } from '@constants/comments';
import { TagComponent } from '../../social/tag/tag.component';
import { Friend } from '@models/friends';

@Component({
  selector: 'spot-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  @Input() detailed: boolean;
  @Input() inRange: boolean;
  @Input() comment: Comment;
  @Input() postLink: string;

  @ViewChild('options') options;
  @ViewChild('text') text;
  @ViewChild('reply') reply;

  STRINGS = STRINGS.MAIN.COMMENTS;
  COMMENTS_CONSTANTS = COMMENTS_CONSTANTS;

  // For large comments
  expanded = false;
  isExpandable = false;

  friends$: Observable<Friend[]>;
  friendsList: Friend[] = [];

  @ViewChild('tag') tag: ElementRef;
  @ViewChild('tagelem') tagelem: TagComponent;
  showTag = false;
  tagName = '';
  tagElement;
  tagCaretPosition;

  replyText: string;

  // fix this type
  replies$: Observable<any>;
  replies = [];
  totalReplies = 0;
  numLoaded = 0;

  isAuthenticated$: Observable<boolean>;

  // files
  FILENAME_MAX_SIZE = 25;
  imageFile: File;
  imgSrc: string = null;

  // displaying used characters for add comment
  MAX_COMMENT_LENGTH = 300;
  currentLength = 0;

  timeMessage: string;
  showAddReply = false;
  optionsEnabled = false;
  addReplyError = '';

  currentOffset = 0;

  constructor(private store$: Store<RootStoreState.State>,
              private commentService: CommentService,
              public domSanitizer: DomSanitizer,
              private modalService: ModalService,
              private alertService: AlertService) {
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

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriends)
    );

    this.friends$.pipe(takeUntil(this.onDestroy)).subscribe ( friends => {
      this.friendsList = friends;
    });

    // if detailed load more replies
    const initialLimit = this.detailed ? 10 : 5;

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

    this.setContentHTML();

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  offClickHandler(event: MouseEvent) {
    if (!this.options.nativeElement.contains(event.target)) {
      this.setOptions(false);
    }

    if (!this.tag.nativeElement.contains(event.target)) {
      this.showTag = false;
    }

    // Check caret position
    if (this.comment && this.reply.nativeElement.contains(event.target)) {
      this.getAndCheckWordOnCaret();
    }

  }

  onEnter() {
    // Add tag on enter
    if ( this.showTag ) {
      this.tagelem.onEnter();
      return false;
    }
  }

  setContentHTML() {

    // Get the content strings
    const content = this.getContent();
    const div = document.createElement('div');
    let lastOffset = 0;

    // Important
    // Tags must be given in asc order of their offset
    // Server should do this for you
    if ( this.comment.tag.tags.length > 0 ) {

      this.comment.tag.tags.forEach( (tag: Tag) => {

        // check if tag should even be shown
        if ( tag.offset <= content.length || this.expanded ) {

          // create the span that will hold the tag
          const span = document.createElement('span');
          // fill with text leading up to the tag
          const textBefore = document.createTextNode(content.substring(lastOffset, Math.min(tag.offset, content.length)));
          // create the tag and give the username
          const inlineTag = document.createElement('span');
          inlineTag.className = 'tag-inline-comment';

          // <span class="material-icons"> person </span>
          if ( tag.username ) {
            const username = document.createTextNode(tag.username ? tag.username : '???');
            inlineTag.appendChild(username);
          } else {
            // we don't know the person

            const inlineTagIcon = document.createElement('span');

            inlineTagIcon.textContent = 'person';
            inlineTagIcon.className = 'material-icons tag-inline-comment-icon';

            const username = document.createTextNode('???');

            inlineTag.appendChild(inlineTagIcon);
            inlineTag.appendChild(username);

          }

          // Add them to the span
          span.appendChild(textBefore);
          span.appendChild(inlineTag);

          // update the lastOffset
          lastOffset = Math.min(tag.offset, content.length);

          div.appendChild(span);

        } else {

          // fill in the rest of the content from the last tag
          const textContent = document.createTextNode(content.substring(lastOffset));
          div.appendChild(textContent);
          lastOffset = content.length;

        }

      });

    } else {

      // No tags, just add the text content
      const textContent = document.createTextNode(content);
      div.appendChild(textContent);
      lastOffset = content.length;

    }

    // if there is still content left
    if ( lastOffset < content.length ) {
      const after = document.createTextNode(content.substring(lastOffset));
      div.appendChild(after);
    }

    // Add ellipsis if its expandable and isnt expanded
    if ( this.isExpandable && ! this.expanded ) {
      const ellipsis = document.createTextNode(' ...');
      div.appendChild(ellipsis);
    }

    // set the innerHTML
    this.text.nativeElement.innerHTML = div.innerHTML;

  }

  // Returns the content that will be shown and truncates if need be
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

    return truncatedContent;

  }

  onTextInput(event) {

      // Need to count newlines as a character, -1 because the first line is free
      this.currentLength = Math.min(event.target.textContent.length + event.target.childNodes.length - 1, 0);
      this.addReplyError = null;

      // Check for tag
      this.getAndCheckWordOnCaret();

  }

  getAndCheckWordOnCaret() {
    const range = window.getSelection().getRangeAt(0);
    if (range.collapsed) {
      return this.checkWord(this.getCurrentWord(range.startContainer, range.startOffset), range.startContainer, range.startOffset);
    }
    return '';
  }

  private getCurrentWord(element, position) {
    // Get content of div
    const content = element.textContent;

    // Check if clicked at the end of word
    position = content[position] === ' ' ? position - 1 : position;

    // Get the start and end index
    let startPosition = content.lastIndexOf(' ', position);
    let endPosition = content.indexOf(' ', position);

    // Special cases
    startPosition = startPosition === content.length ? 0 : startPosition;
    endPosition = endPosition === -1 ? content.length : endPosition;

    return content.substring(startPosition + 1, endPosition);
  }

  private checkWord(word: string, element, position) {

    if ( word.length > 1 && word[0] === '@' ) {
      this.tagName = word.slice(1);
      this.showTag = true;
      this.tagElement = element;
      this.tagCaretPosition = position;
    } else {
      this.tagName = '';
      this.showTag = false;
      this.tagElement = null;
      this.tagCaretPosition = null;
    }

  }

  addTag(username: string) {

      // check if they are your friend
      if ( this.friendsList.find( (friend: Friend) =>  friend.username === username ) === undefined ) {
        this.alertService.error('Only friends can be tagged');
        return;
      }

      // remove the word
      this.removeWord(this.tagElement, this.tagCaretPosition, username);

      // refocus at end of content editable
      this.placeCaretAtEnd(this.reply.nativeElement);

      // hide tag menu
      this.tagName = '';
      this.showTag = false;
      this.tagElement = null;
      this.tagCaretPosition = null;

  }

  private placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection !== 'undefined'
            && typeof document.createRange !== 'undefined') {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        // needed for browser compatibility
        // @ts-ignore
    } else if (typeof document.body.createTextRange !== 'undefined') {
        // @ts-ignore
        const textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
  }

  private removeWord(element, position, username) {

    const content = element.textContent;

    // Check if clicked at the end of word
    position = content[position] === ' ' ? position - 1 : position;

    let startPosition = content.lastIndexOf(' ', position);
    let endPosition = content.indexOf(' ', position);

    // Special cases
    startPosition = startPosition === content.length ? 0 : startPosition;
    endPosition = endPosition === -1 ? content.length : endPosition;

    const parent = element.parentNode;

    const span = document.createElement('span');
    const beforeText = document.createTextNode(content.substring(0, startPosition + 1));
    const tag = document.createElement('span');
    tag.className = 'tag-inline';
    tag.contentEditable = 'false';
    const usernameText = document.createTextNode(username);
    tag.appendChild(usernameText);
    const afterText = document.createTextNode(content.substring(endPosition));
    span.appendChild(beforeText);
    span.appendChild(tag);
    span.appendChild(afterText);

    parent.replaceChild(span, element);

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

  addReply() {

    let content = this.reply.nativeElement.innerHTML;

    // parse the innerhtml to return a string with newlines instead of innerhtml
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(content, 'text/html');

    const body = parsedHtml.getElementsByTagName('body');

    const tags: Tag[] = [];
    let text = '';
    let offset = 0;

    // Do a dfs on the html tree
    let stack = [];
    stack = stack.concat([].slice.call(body[0].childNodes, 0).reverse());

    while ( stack.length > 0 ) {

      const elem = stack.pop();

      // A tag
      if ( elem.className === 'tag-inline' ) {
        const tag: Tag = {
          username: elem.textContent,
          postLink: this.postLink,
          offset
        };
        tags.push(tag);
        // A tag has no children, continue
        continue;
      }

      // Push the children
      // In reverse because we want to parse the from left to right
      if ( elem.childNodes ) {
        stack = stack.concat([].slice.call(elem.childNodes, 0).reverse());
      }

      // Don't add spaces to start
      if ( elem.tagName === 'DIV' && text.length > 0 ) {
        // A new Div
        text += '\n';
        offset += 1;
      } else if ( elem.nodeType === 3 ) {
        // Text Node
        text += elem.textContent;
        offset += elem.textContent.length;
      }

    }

    // There should already be no spaces at start, this should just remove
    // spaces at the end
    // tag offsets will be adjusted on the server to never be more than content length
    content = text.trim();

    // Error checking

    if ( content.split(/\r\n|\r|\n/).length > COMMENTS_CONSTANTS.MAX_LINE_LENGTH ) {
      this.addReplyError = 'Your reply must be less than ' + COMMENTS_CONSTANTS.MAX_LINE_LENGTH + ' lines';
      return;
    }

    if ( content.length === 0 && !this.imageFile && tags.length === 0 ) {
      this.addReplyError = 'Your reply must have a tag, text or an image';
      return;
    }

    if ( content.length < COMMENTS_CONSTANTS.MIN_CONTENT_LENGTH ) {
      this.addReplyError = 'Reply must be greater than ' + COMMENTS_CONSTANTS.MIN_CONTENT_LENGTH + ' characters';
      return;
    }

    if (content.length > COMMENTS_CONSTANTS.MAX_CONTENT_LENGTH) {
      this.addReplyError = 'Reply must be less than ' + COMMENTS_CONSTANTS.MAX_CONTENT_LENGTH + ' characters';
      return;
    }

    // Only allow ascii characters currently, so check anything but ascii
    // So user knows what they need to change
    const regex = /^[^\x00-\x7F]*$/;
    const match = content.match(regex);
    if ( match && match[0].length > 0 ) {
      this.addReplyError = 'Invalid spot content ' + match[0];
      return;
    }

    // Make the reqest
    const request: AddReplyRequest = {
      postId: this.comment.post_id,
      commentId: this.comment.id,
      content,
      image: this.imageFile,
      tagsList: tags
    };

    this.store$.dispatch(
      new CommentsStoreActions.AddReplyRequestAction(request)
    );

  }

  setShowAddReply(val: boolean) {
    this.showAddReply = val;
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
