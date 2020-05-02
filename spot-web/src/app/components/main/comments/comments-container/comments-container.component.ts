import { Component, OnInit, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

import { STRINGS } from '@assets/strings/en';
import { RootStoreState } from '@store';
import { CommentsStoreSelectors, CommentsStoreActions } from '@store/comments-store';
import { LoadCommentsRequest, AddCommentRequest } from '@models/comments';
import { Tag } from '@models/notifications';
import { Post } from '@models/posts';

@Component({
  selector: 'spot-comments-container',
  templateUrl: './comments-container.component.html',
  styleUrls: ['./comments-container.component.scss']
})
export class CommentsContainerComponent implements OnInit {

  @Input() detailed: boolean;
  @Input() post: Post;

  commentText: string;

  tags: Tag[] = [];
  showTag = false;
  tagName = '';

  // fix this type
  comments$: Observable<any>;

  comments = [];
  totalComments = 0;
  numLoaded = 0;

  FILENAME_MAX_SIZE = 25;
  imageFile: File;
  imgSrc: string = null;

  STRINGS = STRINGS.MAIN.COMMENTS_CONTAINER;

  // displaying used characters for add comment
  MAX_COMMENT_LENGTH = 300;
  currentLength = 0;

  // for dynamic loading
  currentOffset = 0;

  constructor(private store$: Store<RootStoreState.State>,
              public domSanitizer: DomSanitizer) {
  }

  ngOnInit() {

    this.comments$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectMyFeatureComments, { postId: this.post.id })
    );

    this.comments$.subscribe( comments => {
      this.comments = comments.comments;
      this.totalComments = comments.totalComments;
    });

    // if detailed load more comments
    let initialLimit;
    if ( this.detailed ) {
      initialLimit = 10;
    } else {
      initialLimit = 1;
    }

    const request: LoadCommentsRequest = {
      postId: this.post.id,
      offset: this.currentOffset,
      limit: initialLimit
    };

    this.store$.dispatch(
      new CommentsStoreActions.GetRequestAction(request)
    );
    this.numLoaded += initialLimit;
    this.currentOffset += initialLimit;

  }

  onTextInput(event) {

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

  loadMoreComments() {
    // Load 1 more comments
    const limit = 1;
    const request: LoadCommentsRequest = {
      postId: this.post.id,
      offset: this.currentOffset,
      limit
    };
    this.store$.dispatch(
      new CommentsStoreActions.GetRequestAction(request)
    );
    this.numLoaded += limit;
    this.currentOffset += limit;
  }

  addComment() {

    const content = this.commentText;

    if (content.length <= this.MAX_COMMENT_LENGTH) {

      const request: AddCommentRequest = {
        postId: this.post.id,
        content,
        image: this.imageFile
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

  getDisplayFilename(name: string) {
    if (name.length > this.FILENAME_MAX_SIZE) {
      return name.substr(0, this.FILENAME_MAX_SIZE) + '...';
    } else {
      return name;
    }
  }

  sendTag(tag: Tag) {

    // replace last word with an object, identify that with a tag
    // Need a way to delete the tag if you backspace an entire object

    this.tags.push(tag);

  }

}
