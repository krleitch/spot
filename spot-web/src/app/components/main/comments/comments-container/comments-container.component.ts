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
  commentText: string;

  @ViewChild('tag') tag: ElementRef;
  tags: Tag[] = [];
  showTag = false;
  tagName = '';

  // fix this type
  comments$: Observable<any>;
  loadingCommentsBefore$: Observable<{ loading: boolean, id: string }>;
  loadingCommentsAfter$: Observable<{ loading: boolean, id: string }>;
  addCommentError$: Observable<{ error: SpotError, id: string }>;
  addCommentSuccess$: Observable<{ success: boolean, id: string }>;
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
  currentLength = 0;

  constructor(private store$: Store<RootStoreState.State>,
              public domSanitizer: DomSanitizer) {
    document.addEventListener('click', this.offClickHandler.bind(this));
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
    }
  }

  onTextInput(event) {

    // TODO: A space should add a tag

    this.commentText = event.target.textContent;
    this.currentLength = this.commentText.length;

    const words = this.commentText.split(' ');
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

    const content = this.commentText;

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

      this.commentText = '';
      this.imageFile = null;

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

    tag.id = this.tags.length;
    this.tags.push(tag);

    const words = this.commentText.split(' ');
    words.pop();
    this.commentText = words.join(' ');

  }

  removeTag(id: number) {

    this.tags = this.tags.filter( (tag: Tag) => {
      return tag.id !== id;
    });

  }

}
