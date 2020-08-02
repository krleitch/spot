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
import { COMMENTS_CONSTANTS } from '@constants/comments';
import { TagComponent } from '../../social/tag/tag.component';

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

  imageFile: File;
  imgSrc: string = null;

  STRINGS = STRINGS.MAIN.COMMENTS_CONTAINER;
  COMMENTS_CONSTANTS = COMMENTS_CONSTANTS;

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
        this.removeFile();
        this.comment.nativeElement.innerText = '';
        this.comment.nativeElement.innerHtml = '';
        Array.from(this.comment.nativeElement.children).forEach((c: HTMLElement) => c.innerHTML = '');
        this.comment.nativeElement.innerHTML = '';
        this.currentLength = this.comment.nativeElement.innerHTML.length;
      }
    });

    this.addCommentError$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectAddCommentError)
    );

    this.addCommentError$.pipe(takeUntil(this.onDestroy)).subscribe( error => {
      if ( error.error && this.post.id === error.id ) {
        this.addCommentError = error.error.message;
      }
    });

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriends)
    );

    // TODO: can probably not make this request, fetch friends at app startup instead?
    // TAG component should always make this call anyways
    const friendRequest: GetFriendsRequest = {
      date: new Date().toString(),
      limit: null
    };

    this.store$.dispatch(
      new SocialStoreFriendsActions.GetFriendsAction(friendRequest)
    );

    this.friends$.pipe(takeUntil(this.onDestroy)).subscribe ( friends => {
      this.friendsList = friends;
    });

    // if detailed load more comments
    let initialLimit;
    if ( this.detailed ) {
      initialLimit = COMMENTS_CONSTANTS.DETAILED_INITIAL_LIMIT;
    } else {
      initialLimit = COMMENTS_CONSTANTS.INITIAL_LIMIT;
    }

    // Get the latests limit # of comments
    const request: LoadCommentsRequest = {
      postId: this.post.id,
      date: new Date().toString(),
      type: 'before',
      limit: initialLimit,
      commentId: this.post.startCommentId || null,
      initialLoad: this.initialLoad
    };

    this.initialLoad = false;

    this.store$.dispatch(
      new CommentsStoreActions.GetRequestAction(request)
    );

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

  private removeWord(element, position, username) {

    const content = element.textContent;

    // Check if clicked at the end of word
    position = content[position] === ' ' ? position - 1 : position;

    let startPosition = content.lastIndexOf(' ', position);
    let endPosition = content.indexOf(' ', position);

    // Special cases
    startPosition = startPosition === content.length ? 0 : startPosition;
    endPosition = endPosition === -1 ? content.length : endPosition;

    // if we pressed space to add the tag, remove the extra space
    // element.textContent = content.substring(0, startPosition + 1) + content.substring(endPosition);

    element.textContent = '';

    // TEST

    const parent = element.parentNode;

    const div = document.createElement('span');
    const before = document.createTextNode(content.substring(0, startPosition + 1));
    const tag = document.createElement('span');
    tag.className = 'tag-inline';
    tag.contentEditable = 'false';
    const name = document.createTextNode(username);
    tag.appendChild(name);
    const after = document.createTextNode(content.substring(endPosition));
    div.appendChild(before);
    div.appendChild(tag);
    div.appendChild(after);

    parent.replaceChild(div, element); // .appendChild(div);

  }

  onEnter() {

    // Add tag on enter
    if ( this.showTag ) {

      this.tagelem.onEnter();

      return false;

    }

  }

  loadRecentComments() {
    const limit = COMMENTS_CONSTANTS.RECENT_LIMIT;
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
  }

  loadMoreComments() {
    const limit = COMMENTS_CONSTANTS.MORE_LIMIT;
    const request: LoadCommentsRequest = {
      postId: this.post.id,
      date: this.comments.length > 0 ? this.comments.slice(-1).pop().creation_date : new Date().toString(),
      type: 'before',
      limit,
      initialLoad: this.initialLoad
    };
    this.store$.dispatch(
      new CommentsStoreActions.GetRequestAction(request)
    );
  }

  addComment() {

    let content = this.comment.nativeElement.innerHTML;

    // parse the innerhtml to return a string with newlines instead of innerhtml
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(content, 'text/html');

    const body = parsedHtml.getElementsByTagName('body');
    const bodyChildren = body[0].children;

    const tags: Tag[] = [];
    let text = '';
    let offset = 0;

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
        continue;
      }

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

    // just needed to remove spaces at end
    content = text.trim();

    console.log(content);

    if ( content.split(/\r\n|\r|\n/).length > COMMENTS_CONSTANTS.MAX_LINE_LENGTH ) {
      this.addCommentError = 'Your comment must be less than ' + COMMENTS_CONSTANTS.MAX_LINE_LENGTH + ' lines';
      return;
    }

    if ( content.length === 0 && !this.imageFile ) {
      this.addCommentError = 'Your comment must have text or an image';
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

    return;

    this.store$.dispatch(
      new CommentsStoreActions.AddRequestAction(request)
    );

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

  addTag(username: string) {

    // check if they are your friend
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

}
