import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

import { STRINGS } from '@assets/strings/en';
import { RootStoreState } from '@store';
import { CommentsStoreSelectors, CommentsStoreActions } from '@store/comments-store';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { LoadCommentsRequest, AddCommentRequest } from '@models/comments';
import { Tag } from '@models/notifications';
import { Post } from '@models/posts';
import { SpotError } from '@exceptions/error';
import { Friend, GetFriendsRequest } from '@models/friends';
import { SocialStoreFriendsActions, SocialStoreSelectors } from '@store/social-store';
import { AlertService } from '@services/alert.service';

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
  commentInnerHtml = '';
  currentLength = 0;

  @ViewChild('tag') tag: ElementRef;
  tags: Tag[] = [];
  showTag = false;
  tagName = '';
  tagElement;
  tagCaretPosition;

  // fix this type
  comments$: Observable<any>;
  loadingCommentsBefore$: Observable<{ loading: boolean, id: string }>;
  loadingCommentsAfter$: Observable<{ loading: boolean, id: string }>;
  addCommentError$: Observable<{ error: SpotError, id: string }>;
  addCommentSuccess$: Observable<{ success: boolean, id: string }>;
  addCommentError: string;

  friends$: Observable<Friend[]>;
  friendsList: Friend[] = [];

  initialLoad = true;

  isAuthenticated$: Observable<boolean>;

  comments = [];
  totalCommentsBefore = 0;
  numLoaded = 0;

  imageFile: File;
  imgSrc: string = null;

  STRINGS = STRINGS.MAIN.COMMENTS_CONTAINER;

  // displaying used characters for add comment
  MAX_COMMENT_LENGTH = 300;

  constructor(private store$: Store<RootStoreState.State>,
              private alertService: AlertService,
              public domSanitizer: DomSanitizer) {
    document.addEventListener('click', this.offClickHandler.bind(this));
    document.addEventListener('click', this.caretPositionHandler.bind(this));
  }

  ngOnInit() {

    this.comments$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectMyFeatureComments, { postId: this.post.id })
    );

    this.comments$.pipe(takeUntil(this.onDestroy)).subscribe( comments => {
      this.comments = comments.comments;
      if ( comments.totalCommentsBefore !== - 1 ) {
        this.totalCommentsBefore = comments.totalCommentsBefore;
      }
    });

    this.loadingCommentsBefore$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectMyFeatureLoadingCommentsBefore)
    );

    this.loadingCommentsAfter$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectMyFeatureLoadingCommentsAfter)
    );

    this.isAuthenticated$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsAuthenticated)
    );

    this.addCommentSuccess$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectAddCommentSuccess)
    );

    this.addCommentSuccess$.pipe(takeUntil(this.onDestroy)).subscribe( success => {
      if ( success.id === this.post.id && success.success ) {

      }
    });

    this.addCommentError$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectAddCommentError)
    );

    this.addCommentError$.pipe(takeUntil(this.onDestroy)).subscribe( error => {
      if ( error.id ) {
        console.log(error.error);
      }
    });

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriends)
    );

    // TODO: can probably not make this request, fetch friends at app startup instead?
    // TAG component should always make this call anyways
    const friendRequest: GetFriendsRequest = {};

    this.store$.dispatch(
      new SocialStoreFriendsActions.GetFriendsAction(friendRequest)
    );

    this.friends$.pipe(takeUntil(this.onDestroy)).subscribe ( friends => {
      this.friendsList = friends;
    });

    // if detailed load more comments
    let initialLimit;
    if ( this.detailed ) {
      initialLimit = 10;
    } else {
      initialLimit = 1;
    }

    let request: LoadCommentsRequest;

    if ( this.post.startCommentId ) {
      // Get the latests limit # of comments
      request = {
        postId: this.post.id,
        date: new Date().toString(),
        type: 'before',
        limit: initialLimit,
        commentId: this.post.startCommentId,
        initialLoad: this.initialLoad
      };
    } else {
      // Get the latests limit # of comments
      request = {
        postId: this.post.id,
        date: new Date().toString(),
        type: 'before',
        limit: initialLimit,
        initialLoad: this.initialLoad
      };
    }

    this.initialLoad = false;

    this.store$.dispatch(
      new CommentsStoreActions.GetRequestAction(request)
    );
    this.numLoaded += initialLimit;

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  offClickHandler(event: MouseEvent) {
    if (!this.tag.nativeElement.contains(event.target)) {
      this.showTag = false;
      this.tagName = '';
    }
  }

  caretPositionHandler(event: MouseEvent) {
    if (this.comment && this.comment.nativeElement.contains(event.target)) {
      this.getAndCheckWordOnCaret();
    }
  }

  onTextInput(event) {

    this.commentInnerHtml = event.target.innerHTML;
    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = event.target.textContent.length + event.target.childNodes.length - 1;
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

  private removeWord(element, position) {

    const content = element.textContent;

    // Check if clicked at the end of word
    position = content[position] === ' ' ? position - 1 : position;

    let startPosition = content.lastIndexOf(' ', position);
    let endPosition = content.indexOf(' ', position);

    // Special cases
    startPosition = startPosition === content.length ? 0 : startPosition;
    endPosition = endPosition === -1 ? content.length : endPosition;

    // if we pressed space to add the tag, remove the extra space
    element.textContent = content.substring(0, startPosition + 1) + content.substring(endPosition);
  }

  onEnter() {

    // Add tag on enter
    if ( this.showTag ) {

      const tag: Tag = {
        id: -1, // Tag not placed yet
        receiver: this.tagName,
        postLink: this.post.link
      };

      this.addTag(tag);
      return false;

    }

  }

  loadRecentComments() {
    // Load 1 more comments
    const limit = 1;
    const request: LoadCommentsRequest = {
      postId: this.post.id,
      date: this.comments.length > 0 ? this.comments[0].creation_date : null,
      type: 'after',
      limit,
      initialLoad: this.initialLoad
    };
    this.store$.dispatch(
      new CommentsStoreActions.GetRequestAction(request)
    );
    this.numLoaded += limit;
  }

  loadMoreComments() {
    // Load 1 more comments
    const limit = 1;
    const request: LoadCommentsRequest = {
      postId: this.post.id,
      date: this.comments.slice(-1).pop().creation_date,
      type: 'before',
      limit,
      initialLoad: this.initialLoad
    };
    this.store$.dispatch(
      new CommentsStoreActions.GetRequestAction(request)
    );
    this.numLoaded += limit;
  }

  addComment() {

    let content = this.commentInnerHtml;

    // parse the innerhtml to return a string with newlines instead of innerhtml
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(content, 'text/html');

    const body = parsedHtml.getElementsByTagName('body');
    const bodyChildren = body[0].children;

    let text;
    if ( body[0].childNodes.length > 0 ) {
      text = body[0].childNodes[0].nodeValue || '';

      for (let i = 0; i < bodyChildren.length; i++) {
        if ( i === 0 ) {
          text += '\n';
        }
        text +=  (bodyChildren[i].textContent);
        if ( i !== bodyChildren.length - 1 ) {
          text += '\n';
        }
      }

    } else {
      text = body[0].textContent;
    }

    content = text.trim();

    if (content.length <= this.MAX_COMMENT_LENGTH) {

      const request: AddCommentRequest = {
        postId: this.post.id,
        content,
        image: this.imageFile,
        tagsList: this.tags
      };

      this.store$.dispatch(
        new CommentsStoreActions.AddRequestAction(request)
      );
    }
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

  addTag(tag: Tag) {

    // check if they are your friend
    if ( this.friendsList.find( (friend: Friend) =>  friend.username === tag.receiver ) === undefined ) {
      this.alertService.error('Only friends can be tagged');
      return;
    }

    // temp id, giving position in array
    tag.id = this.tags.length;
    this.tags.push(tag);

    // remove the word
    this.removeWord(this.tagElement, this.tagCaretPosition);

    // refocus at end of content editable
    this.placeCaretAtEnd(this.comment.nativeElement);

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

  removeTag(id: number) {

    this.tags = this.tags.filter( (tag: Tag) => {
      return tag.id !== id;
    });

  }

}
