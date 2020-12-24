import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

// Store
import { select, Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import { CommentsStoreSelectors, CommentsStoreActions } from '@store/comments-store';
import { StoreComment } from '@store/comments-store/state';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { SocialStoreSelectors } from '@store/social-store';

// Services
import { CommentService } from '@services/comments.service';
import { AlertService } from '@services/alert.service';

// Models
import { GetCommentsRequest, AddCommentRequest, GetCommentsSuccess, SetCommentsStoreRequest,
          AddCommentStoreRequest, AddCommentSuccess } from '@models/comments';
import { Tag } from '@models/notifications';
import { Post } from '@models/posts';
import { Friend } from '@models/friends';
import { SpotError } from '@exceptions/error';
import { Location } from '@models/accounts';

// Components
import { TagComponent } from '../../social/tag/tag.component';

// Assets
import { STRINGS } from '@assets/strings/en';
import { COMMENTS_CONSTANTS } from '@constants/comments';

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
  showTagBottom = false;
  tagName = '';
  tagElement: Node;
  tagCaretPosition;

  comments$: Observable<StoreComment>;
  comments = [];
  totalCommentsBefore = 0;
  totalCommentsAfter = 0;
  loadingCommentsBefore = false;
  loadingCommentsAfter = false;
  refreshed = false;
  addCommentLoading = false;
  addCommentError: string;

  location$: Observable<Location>
  location: Location;
  friends$: Observable<Friend[]>;
  friends: Friend[] = [];

  initialLoad = true;

  isAuthenticated$: Observable<boolean>;
  isVerified$: Observable<boolean>;

  imageFile: File;
  imgSrc: string = null;

  STRINGS = STRINGS.MAIN.COMMENTS_CONTAINER;
  COMMENTS_CONSTANTS = COMMENTS_CONSTANTS;

  constructor(private store$: Store<RootStoreState.State>,
              private alertService: AlertService,
              public domSanitizer: DomSanitizer,
              public commentService: CommentService) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit(): void {

    // Comments
    this.comments$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectComments, { postId: this.post.id }),
    );

    this.comments$.pipe(takeUntil(this.onDestroy)).subscribe( (storeComments: StoreComment) => {
      this.comments = storeComments.comments;
    });

    // Authentication
    this.isAuthenticated$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsAuthenticated)
    );

    // Verified
    this.isVerified$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsVerified)
    );

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectLocation)
    );

    this.location$.pipe(takeUntil(this.onDestroy)).subscribe ( (location: Location) => {
      this.location = location;
    });

    // Friends
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    this.friends$.pipe(takeUntil(this.onDestroy)).subscribe( (friends: Friend[]) => {
      this.friends = friends;
    });

    // if detailed load more comments
    const initialLimit = this.detailed ? COMMENTS_CONSTANTS.DETAILED_INITIAL_LIMIT : COMMENTS_CONSTANTS.INITIAL_LIMIT;

    // Get the latest initialLimit of comments
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

      }
    }, (err: SpotError) => {
      // Ignore error case for now
    });

  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  offClickHandler(event: MouseEvent): void {
    if (this.tag && !this.tag.nativeElement.contains(event.target)) {
      this.showTag = false;
      this.showTagBottom = false;
      this.tagName = '';
    }

    if (this.comment && this.comment.nativeElement.contains(event.target)) {
      this.getAndCheckWordOnCaret();
    }
  }

  onTextInput(event): void {

    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = Math.max(event.target.textContent.length + event.target.childNodes.length - 1, 0);
    this.addCommentError = null;

    // Check for tag
    this.getAndCheckWordOnCaret();

  }

  getAndCheckWordOnCaret(): void {
    const range = window.getSelection().getRangeAt(0);
    if (range.collapsed) {
      this.checkWord(this.getCurrentWord(range.startContainer, range.startOffset), range.startContainer, range.startOffset);
    }
  }

  private getCurrentWord(element: Node, position: number): string {
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

  private checkWord(word: string, element: Node, position: number): void {

    // Check if starts with '@', if it does then show tag
    if ( word.length > 1 && word[0] === '@' ) {
      this.tagName = word.slice(1);
      this.showTagTrue();
      this.tagElement = element;
      this.tagCaretPosition = position;
    } else {
      this.tagName = '';
      this.showTag = false;
      this.showTagBottom = false;
      this.tagElement = null;
      this.tagCaretPosition = null;
    }

  }

  // Creates the inline tag and removes the word
  private removeWord(element: Node, position: number, username: string): void {

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

  onEnter(): boolean {
    // Add tag on enter
    if ( this.showTag ) {
      this.tagelem.onEnter();
      return false;
    }
  }

  addTag(username: string): void {

    // Check if they are your friend
    if ( this.friends.find( (friend: Friend) =>  friend.username === username ) === undefined ) {
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
    this.showTagBottom = false;
    this.tagElement = null;
    this.tagCaretPosition = null;

  }

  private placeCaretAtEnd(element): void {
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

  addComment(): void {

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

    // Make the request
    const request: AddCommentRequest = {
      postId: this.post.id,
      content,
      image: this.imageFile,
      tagsList: tags,
      location: this.location
    };

    this.addCommentLoading = true;

    this.commentService.addComment(request).pipe(take(1)).subscribe( (comment: AddCommentSuccess) => {

      const storeRequest: AddCommentStoreRequest = {
        postId: comment.postId,
        comment: comment.comment
      };

      this.store$.dispatch(
        new CommentsStoreActions.AddCommentRequestAction(storeRequest)
      );

      this.addCommentLoading = false;
      this.removeFile();
      this.comment.nativeElement.innerText = '';
      this.comment.nativeElement.innerHtml = '';
      Array.from(this.comment.nativeElement.children).forEach((c: HTMLElement) => c.innerHTML = '');
      this.comment.nativeElement.innerHTML = '';
      this.currentLength = this.comment.nativeElement.innerHTML.length;

    }, (err: SpotError) => {
      this.addCommentLoading = false;
      this.addCommentError = err.message;
    });

  }

  loadRecentComments(): void {

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

  loadMoreComments(): void {

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

  onFileChanged(event): void {
    if ( event.target.files.length > 0 ) {
      this.imageFile = event.target.files[0];
      this.imgSrc = window.URL.createObjectURL(this.imageFile);
    }
  }

  removeFile(): void {
    this.imageFile = null;
    this.imgSrc = null;
  }

  makeComment(): void {
    const yOffset = -100;
    const y = this.comment.nativeElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({top: y, behavior: 'smooth'});
    this.comment.nativeElement.focus({
      preventScroll: true,
    });
  }

  showTagTrue(): void {

    const distanceToTop = this.tag.nativeElement.getBoundingClientRect().top;

    if ( distanceToTop < 200 ) {
      this.showTagBottom = true;
    } else {
      this.showTagBottom = false;
    }

    this.showTag = true;

  }

}
