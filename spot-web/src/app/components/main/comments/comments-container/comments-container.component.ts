import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

import { STRINGS } from '@assets/strings/en';
import { RootStoreState } from '@store';
import { CommentsStoreSelectors, CommentsStoreActions } from '@store/comments-store';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { GetCommentsRequest, AddCommentRequest, GetCommentsSuccess, SetCommentsStoreRequest,
          AddCommentStoreRequest, AddCommentSuccess } from '@models/comments';
import { Tag } from '@models/notifications';
import { Post } from '@models/posts';
import { SpotError } from '@exceptions/error';
import { Friend } from '@models/friends';
import { SocialStoreSelectors } from '@store/social-store';
import { AlertService } from '@services/alert.service';
import { COMMENTS_CONSTANTS } from '@constants/comments';
import { TagComponent } from '../../social/tag/tag.component';
import { CommentsHelper } from '@helpers/comments';
import { CommentService } from '@services/comments.service';

@Component({
  selector: 'spot-comments-container',
  templateUrl: './comments-container.component.html',
  styleUrls: ['./comments-container.component.scss']
})
export class CommentsContainerComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  @Input() detailed: boolean;
  @Input() post: Post;

  @ViewChild('comment') comment: ElementRef;
  currentLength = 0;

  @ViewChild('tag') tag: ElementRef;
  @ViewChild('tagelem') tagelem: TagComponent;
  showTag = false;
  tagName = '';
  tagElement;
  tagCaretPosition;

  // fix this type
  comments$: Observable<any>;
  comments = [];
  totalCommentsBefore = 0;
  totalCommentsAfter = 0;
  loadingCommentsBefore = false;
  loadingCommentsAfter = false;
  refreshed = false;
  addCommentError: string;

  friends$: Observable<Friend[]>;
  friendsList: Friend[] = [];

  initialLoad = true;

  isAuthenticated$: Observable<boolean>;

  imageFile: File;
  imgSrc: string = null;

  STRINGS = STRINGS.MAIN.COMMENTS_CONTAINER;
  COMMENTS_CONSTANTS = COMMENTS_CONSTANTS;

  constructor(private store$: Store<RootStoreState.State>,
              private alertService: AlertService,
              public domSanitizer: DomSanitizer,
              public commentsHelper: CommentsHelper,
              public commentService: CommentService) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit() {

    // Get Comments
    this.comments$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectMyFeatureComments, { postId: this.post.id })
    );

    this.comments$.pipe(takeUntil(this.onDestroy)).subscribe( comments => {
      this.comments = comments.comments;
    });

    // Check Authentication
    this.isAuthenticated$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsAuthenticated)
    );

    // friends
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriends)
    );

    this.friends$.pipe(takeUntil(this.onDestroy)).subscribe( friends => {
      this.friendsList = friends;
    });

    // if detailed load more comments
    const initialLimit = this.detailed ? COMMENTS_CONSTANTS.DETAILED_INITIAL_LIMIT : COMMENTS_CONSTANTS.INITIAL_LIMIT;

    // Get the latest limit # of comments
    const request: GetCommentsRequest = {
      postId: this.post.id,
      date: new Date().toString(),
      type: 'before',
      limit: initialLimit,
      commentId: this.post.startCommentId || null,
    };

    this.loadingCommentsBefore = true;

    this.commentService.getComments(request).pipe(take(1)).subscribe( (comments: GetCommentsSuccess) => {
      this.loadingCommentsBefore = false;
      if  ( comments.comments ) {
        const storeRequest: SetCommentsStoreRequest = {
          postId: this.post.id,
          type: 'before',
          commentId: this.post.startCommentId || null,
          initialLoad: this.initialLoad,
          comments: comments.comments
        };
        this.store$.dispatch(
          new CommentsStoreActions.SetCommentsRequestAction(storeRequest),
        );
        this.totalCommentsBefore = comments.totalCommentsBefore;
        this.totalCommentsAfter = comments.totalCommentsAfter;
        this.initialLoad = false;

        if ( comments.totalCommentsAfter === 0) {
          this.refreshed = true;
        }

      }
    }, (err: SpotError) => {
      // Error case
    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  offClickHandler(event: MouseEvent) {
    if (this.tag && !this.tag.nativeElement.contains(event.target)) {
      this.showTag = false;
      this.tagName = '';
    }

    if (this.comment && this.comment.nativeElement.contains(event.target)) {
      this.getAndCheckWordOnCaret();
    }
  }

  onTextInput(event) {

    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = Math.max(event.target.textContent.length + event.target.childNodes.length - 1, 0);
    this.addCommentError = null;

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

  onEnter() {
    // Add tag on enter
    if ( this.showTag ) {
      this.tagelem.onEnter();
      return false;
    }
  }

  addTag(username: string) {

    // Check if they are your friend
    if ( this.friendsList.find( (friend: Friend) =>  friend.username === username ) === undefined ) {
      this.alertService.error('Only friends can be tagged');
      return;
    }

    // remove the word
    this.removeWord(this.tagElement, this.tagCaretPosition, username);

    // refocus at end of content editable
    this.placeCaretAtEnd(this.comment.nativeElement);

    // hide tag menu
    this.tagName = '';
    this.showTag = false;
    this.tagElement = null;
    this.tagCaretPosition = null;

  }

  private placeCaretAtEnd(element) {
    element.focus();
    if (typeof window.getSelection !== 'undefined'
            && typeof document.createRange !== 'undefined') {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        // needed for browser compatibility
        // @ts-ignore
    } else if (typeof document.body.createTextRange !== 'undefined') {
        // @ts-ignore
        const textRange = document.body.createTextRange();
        textRange.moveToElementText(element);
        textRange.collapse(false);
        textRange.select();
    }
  }

  addComment() {

    let content = this.comment.nativeElement.innerHTML;

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
          postLink: this.post.link,
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
      if ( elem.tagName === 'DIV' ) {
        // A new Div
        text += '\n';
        offset += 1;
      } else if ( elem.nodeType === 3 ) {
        // Text Node
        text += elem.textContent;
        offset += elem.textContent.length;
      }

    }

    // TODO: cleanup whitespace here if decide to do it
    // There should already be no spaces at start, this should just remove - check text length 0 before append \n
    // spaces at the end
    // tag offsets will be adjusted on the server to never be more than content length
    content = text;

    // Error checking

    if ( content.split(/\r\n|\r|\n/).length > COMMENTS_CONSTANTS.MAX_LINE_LENGTH ) {
      this.addCommentError = 'Your comment must be less than ' + COMMENTS_CONSTANTS.MAX_LINE_LENGTH + ' lines';
      return;
    }

    if ( content.length === 0 && !this.imageFile && tags.length === 0 ) {
      this.addCommentError = 'Your comment must have a tag, text or an image';
      return;
    }

    if ( content.length < COMMENTS_CONSTANTS.MIN_CONTENT_LENGTH ) {
      this.addCommentError = 'Comment must be greater than ' + COMMENTS_CONSTANTS.MIN_CONTENT_LENGTH + ' characters';
      return;
    }

    if (content.length > COMMENTS_CONSTANTS.MAX_CONTENT_LENGTH) {
      this.addCommentError = 'Comment must be less than ' + COMMENTS_CONSTANTS.MAX_CONTENT_LENGTH + ' characters';
      return;
    }

    // Only allow ascii characters currently, so check anything but ascii
    // So user knows what they need to change
    const regex = /^[^\x00-\x7F]*$/;
    const match = content.match(regex);
    if ( match && match[0].length > 0 ) {
      this.addCommentError = 'Invalid spot content ' + match[0];
      return;
    }

    // Make the reqest
    const request: AddCommentRequest = {
      postId: this.post.id,
      content,
      image: this.imageFile,
      tagsList: tags
    };



    this.commentService.addComment(request).pipe(take(1)).subscribe( (comment: AddCommentSuccess) => {

      const storeRequest: AddCommentStoreRequest = {
        postId: comment.postId,
        comment: comment.comment
      };

      this.store$.dispatch(
        new CommentsStoreActions.AddCommentRequestAction(storeRequest)
      );

      this.removeFile();
      this.comment.nativeElement.innerText = '';
      this.comment.nativeElement.innerHtml = '';
      Array.from(this.comment.nativeElement.children).forEach((c: HTMLElement) => c.innerHTML = '');
      this.comment.nativeElement.innerHTML = '';
      this.currentLength = this.comment.nativeElement.innerHTML.length;

    }, (err: SpotError) => {
      this.addCommentError = err.message;
    });

  }

  loadRecentComments() {

    const limit = COMMENTS_CONSTANTS.RECENT_LIMIT;

    const request: GetCommentsRequest = {
      postId: this.post.id,
      date: this.comments.length > 0 ? this.comments[0].creation_date : null,
      type: 'after',
      limit
    };

    this.loadingCommentsAfter = true;
    this.refreshed = false;

    this.commentService.getComments(request).pipe(take(1)).subscribe( (comments: GetCommentsSuccess) => {
      this.loadingCommentsAfter = false;
      if  ( comments.comments ) {
        const storeRequest: SetCommentsStoreRequest = {
          postId: this.post.id,
          type: 'after',
          initialLoad: this.initialLoad,
          comments: comments.comments
        };
        this.store$.dispatch(
          new CommentsStoreActions.SetCommentsRequestAction(storeRequest),
        );

        // Nothing new was found
        // this has to go before totalCommentsAfter is updated
        if ( comments.totalCommentsAfter === 0) {
          this.refreshed = true;
        }

        this.totalCommentsAfter = comments.totalCommentsAfter;

      }
    }, (err: SpotError) => {
      // Error case
    });

  }

  loadMoreComments() {

    const limit = COMMENTS_CONSTANTS.MORE_LIMIT;

    const request: GetCommentsRequest = {
      postId: this.post.id,
      date: this.comments.length > 0 ? this.comments.slice(-1).pop().creation_date : new Date().toString(),
      type: 'before',
      limit
    };

    this.loadingCommentsAfter = true;

    this.commentService.getComments(request).pipe(take(1)).subscribe( (comments: GetCommentsSuccess) => {
      this.loadingCommentsAfter = false;
      if  ( comments.comments ) {
        const storeRequest: SetCommentsStoreRequest = {
          postId: this.post.id,
          type: 'before',
          initialLoad: this.initialLoad,
          comments: comments.comments
        };
        this.store$.dispatch(
          new CommentsStoreActions.SetCommentsRequestAction(storeRequest),
        );
        this.totalCommentsBefore = comments.totalCommentsBefore;
      }
    }, (err: SpotError) => {
      // Error case
    });

  }

  invalidLength(): boolean {
    return this.currentLength > COMMENTS_CONSTANTS.MAX_CONTENT_LENGTH;
  }

  onFileChanged(event) {
    if ( event.target.files.length > 0 ) {
      this.imageFile = event.target.files[0];
      this.imgSrc = window.URL.createObjectURL(this.imageFile);
    }
  }

  removeFile() {
    this.imageFile = null;
    this.imgSrc = null;
  }

}
