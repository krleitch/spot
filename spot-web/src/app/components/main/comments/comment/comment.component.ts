import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// rxjs
import { Observable, Subject, timer } from 'rxjs';
import { takeUntil, take, mapTo, takeWhile, startWith } from 'rxjs/operators';

// Store
import { select, Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import { CommentsStoreSelectors, CommentsStoreActions } from '@store/comments-store';
import { StoreReply } from '@store/comments-store/state';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { SocialStoreSelectors } from '@store/social-store';

// Services
import { CommentService } from '@services/comments.service';
import { ModalService } from '@services/modal.service';
import { AlertService } from '@services/alert.service';
import { AuthenticationService } from '@services/authentication.service';

// Models
import { Friend } from '@models/friends';
import { SpotError } from '@exceptions/error';
import { AccountMetadata, Location } from '@models/accounts';
import { Comment, DeleteCommentRequest, AddReplyRequest, GetRepliesRequest, GetRepliesSuccess, AddReplySuccess,
         LikeCommentRequest, DislikeCommentRequest, SetRepliesStoreRequest, AddReplyStoreRequest,
         UnratedCommentRequest } from '@models/comments';
import { Post } from '@models/posts';
import { Tag } from '@models/notifications';

// Components
import { TagComponent } from '../../social/tag/tag.component';

// Assets
import { STRINGS } from '@assets/strings/en';
import { COMMENTS_CONSTANTS } from '@constants/comments';

@Component({
  selector: 'spot-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, OnDestroy, AfterViewInit {

  private readonly onDestroy = new Subject<void>();

  @Input() detailed: boolean;
  @Input() comment: Comment;
  @Input() post: Post;

  @ViewChild('options') options;
  @ViewChild('text') text;
  @ViewChild('reply') reply;

  STRINGS = STRINGS.MAIN.COMMENTS;
  COMMENTS_CONSTANTS = COMMENTS_CONSTANTS;

  // For large comments
  expanded = false;
  isExpandable = false;

  location$: Observable<Location>;
  location: Location;
  friends$: Observable<Friend[]>;
  friendsList: Friend[] = [];

  @ViewChild('tag') tag: ElementRef;
  @ViewChild('tagelem') tagelem: TagComponent;
  showTag = false;
  tagName = '';
  tagElement;
  tagCaretPosition;

  replyText: string;

  replies$: Observable<StoreReply>;
  replies: Comment[] = [];
  loadingReplies = false;
  loadingMoreReplies = false;
  showLoadingRepliesIndicator$: Observable<boolean>;
  numRepliesAfter = 0;

  isAuthenticated$: Observable<boolean>;
  isVerified$: Observable<boolean>;
  accountMetadata$: Observable<AccountMetadata>;

  // Image
  FILENAME_MAX_SIZE = 25;
  imageFile: File;
  imgSrc: string = null;
  imageBlurred: boolean; // if content flagged nsfw

  // displaying used characters for add comment
  MAX_COMMENT_LENGTH = 300;
  currentLength = 0;

  timeMessage: string;
  showAddReply = false;
  optionsEnabled = false;

  addReplyError = '';
  addReplyLoading = false;


  constructor(private store$: Store<RootStoreState.State>,
              private commentService: CommentService,
              public domSanitizer: DomSanitizer,
              private modalService: ModalService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit(): void {

    this.replies$ = this.store$.pipe(
      select(CommentsStoreSelectors.selectReplies, { postId: this.comment.post_id, commentId: this.comment.id })
    );

    this.replies$.pipe(takeUntil(this.onDestroy)).subscribe( (storeReply: StoreReply) => {

      this.replies = storeReply.replies;

      // only load replies if we have none
      if ( this.replies.length === 0 ) {

        // if detailed load more replies
        const initialLimit = this.detailed ? 10 : 1;

        const request: GetRepliesRequest = {
          postId: this.comment.post_id,
          commentId: this.comment.id,
          replyLink: this.post.startCommentLink || null,
          date: null,
          initialLoad: true,
          limit: initialLimit
        };

        this.loadingReplies = true;
        this.showLoadingRepliesIndicator$ = timer(500).pipe( mapTo(true), takeWhile( val => this.loadingReplies )).pipe( startWith(false) );

        this.commentService.getReplies(request).pipe(take(1)).subscribe( (replies: GetRepliesSuccess) => {

          const storeRequest: SetRepliesStoreRequest = {
            postId: replies.postId,
            commentId: replies.commentId,
            date: replies.date,
            initialLoad: true,
            replies: replies.replies
          };

          this.store$.dispatch(
            new CommentsStoreActions.SetRepliesRequestAction(storeRequest)
          );

          this.numRepliesAfter = replies.numRepliesAfter;
          this.loadingReplies = false;

        }, (err: SpotError) => {
          this.loadingReplies = false;
        });

      }

    });

    this.isAuthenticated$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsAuthenticated)
    );

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectLocation)
    );

    this.location$.pipe(takeUntil(this.onDestroy)).subscribe ( (location: Location) => {
      this.location = location;
    });

    this.isVerified$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectIsVerified)
    );

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    this.friends$.pipe(takeUntil(this.onDestroy)).subscribe ( friends => {
      this.friendsList = friends;
    });

    this.accountMetadata$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountMetadata)
    );

    this.getTime(this.comment.creation_date);
    this.imageBlurred = this.comment.image_nsfw;

    if ( this.comment.content.split(/\r\n|\r|\n/).length > COMMENTS_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH
         || this.comment.content.length > COMMENTS_CONSTANTS.MAX_TRUNCATE_LENGTH ) {
      this.isExpandable = true;
    }

  }

  ngAfterViewInit(): void {
    this.setContentHTML();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  offClickHandler(event: MouseEvent): void {
    if (this.options && !this.options.nativeElement.contains(event.target)) {
      this.setOptions(false);
    }

    if (this.tag && !this.tag.nativeElement.contains(event.target)) {
      this.showTag = false;
    }

    // Check caret position
    if (this.reply && this.reply.nativeElement.contains(event.target)) {
      this.getAndCheckWordOnCaret();
    }

  }

  onEnter(): boolean {
    // Add tag on enter
    if ( this.showTag ) {
      this.tagelem.onEnter();
      return false;
    }
  }

  setContentHTML(): void {

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

  onTextInput(event): void {

      if ( event.target.textContent.length === 0 ) {
        this.reply.nativeElement.innerHTML = '';
      }
      // Need to count newlines as a character, -1 because the first line is free
      this.currentLength = Math.max(event.target.textContent.length + event.target.childNodes.length - 1, 0);
      this.addReplyError = null;

      // Check for tag
      this.getAndCheckWordOnCaret();

  }

  getAndCheckWordOnCaret(): void {
    const range = window.getSelection().getRangeAt(0);
    if (range.collapsed) {
      if ( range.startContainer.parentElement.className === 'tag-inline' ) {
        range.setStart(range.startContainer.parentElement.nextSibling, 0);
        range.collapse(true);
      } else {
        this.checkWord(this.getCurrentWord(range.startContainer, range.startOffset), range.startContainer, range.startOffset);
      }
    }
  }

  private getCurrentWord(element, position): string {
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

  private checkWord(word: string, element, position): void {

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

  addTag(username: string): void {

      // check if they are your friend
      if ( this.friendsList.find( (friend: Friend) =>  friend.username === username ) === undefined ) {
        this.alertService.error('Only friends can be tagged');
        return;
      }

      // remove the word
      const tagElement = this.removeWord(this.tagElement, this.tagCaretPosition, username);

      // Focus after the tag
      const range = window.getSelection().getRangeAt(0);
      range.setStart(tagElement.nextSibling, 0);
      range.collapse(true);

      // hide tag menu
      this.tagName = '';
      this.showTag = false;
      this.tagElement = null;
      this.tagCaretPosition = null;

  }

  private removeWord(element, position, username): HTMLElement {

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
    return tag;

  }

  setExpanded(value: boolean): void {
    this.expanded = value;
    this.setContentHTML();
  }

  // the number of replies that will be loaded if load more is pressed
  loadMoreRepliesNum(): number {
    return Math.min(this.numRepliesAfter,
                    this.detailed ? this.COMMENTS_CONSTANTS.REPLY_MORE_LIMIT_DETAILED : this.COMMENTS_CONSTANTS.REPLY_MORE_LIMIT);
  }

  loadMoreReplies(): void {

    if ( this.loadingMoreReplies ) {
      return;
    }

    const request: GetRepliesRequest = {
      postId: this.comment.post_id,
      commentId: this.comment.id,
      date: this.replies.slice(-1)[0].creation_date,
      initialLoad: false,
      limit: this.detailed ? this.COMMENTS_CONSTANTS.REPLY_MORE_LIMIT_DETAILED : this.COMMENTS_CONSTANTS.REPLY_MORE_LIMIT,
    };

    this.loadingMoreReplies = true;

    this.commentService.getReplies(request).pipe(take(1)).subscribe( (replies: GetRepliesSuccess) => {

      const storeRequest: SetRepliesStoreRequest = {
        postId: replies.postId,
        commentId: replies.commentId,
        date: replies.date,
        initialLoad: replies.initialLoad,
        replies: replies.replies,
      };

      this.store$.dispatch(
        new CommentsStoreActions.SetRepliesRequestAction(storeRequest)
      );

      this.numRepliesAfter = replies.numRepliesAfter;
      this.loadingMoreReplies = false;

    }, (err: SpotError) => {
      this.loadingMoreReplies = false;
    });

  }

  setOptions(value): void {
    this.optionsEnabled = value;
  }

  getTime(date): void {
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

  deleteComment(): void {

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

  addReply(): void {

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

    // Make the request
    const request: AddReplyRequest = {
      postId: this.comment.post_id,
      commentId: this.comment.id,
      commentParentId: this.comment.id,
      content,
      image: this.imageFile,
      tagsList: tags,
      location: this.location
    };

    this.addReplyLoading  = true;

    this.commentService.addReply(request).pipe(take(1)).subscribe( (reply: AddReplySuccess) => {

      const storeRequest: AddReplyStoreRequest = {
        postId: reply.postId,
        commentId: reply.commentId,
        reply: reply.reply
      };

      this.store$.dispatch(
        new CommentsStoreActions.AddReplyRequestAction(storeRequest)
      );

      this.addReplyLoading  = false;
      this.removeFile();
      this.reply.nativeElement.innerText = '';
      this.reply.nativeElement.innerHtml = '';
      Array.from(this.reply.nativeElement.children).forEach((c: HTMLElement) => c.innerHTML = '');
      this.reply.nativeElement.innerHTML = '';
      this.currentLength = 0;
      this.showAddReply = false;

    }, (err: SpotError) => {
      this.addReplyLoading  = false;
      this.addReplyError = err.message;
    });

  }

  setShowAddReply(val: boolean): void {
    this.showAddReply = val;
    setTimeout( () => {
      if ( this.showAddReply === true && this.reply ) {
        this.reply.nativeElement.focus({
          preventScroll: true,
        });
      }
    }, 100);
  }

  like(): void {

    if ( !this.authenticationService.isAuthenticated() ) {
      this.modalService.open('spot-auth-modal');
      return;
    }

    if (this.comment.rated === 1) {
      const request: UnratedCommentRequest = {
        postId: this.comment.post_id,
        commentId: this.comment.id
      };
      this.store$.dispatch(
        new CommentsStoreActions.UnratedRequestAction(request)
      );
    } else {
      const request: LikeCommentRequest = {
        postId: this.comment.post_id,
        commentId: this.comment.id
      };
      this.store$.dispatch(
        new CommentsStoreActions.LikeRequestAction(request)
      );
    }

  }

  dislike(): void {

    if ( !this.authenticationService.isAuthenticated() ) {
      this.modalService.open('spot-auth-modal');
      return;
    }

    if (this.comment.rated === 0) {
      const request: UnratedCommentRequest = {
        postId: this.comment.post_id,
        commentId: this.comment.id
      };
      this.store$.dispatch(
        new CommentsStoreActions.UnratedRequestAction(request)
      );
    } else {
      const request: DislikeCommentRequest = {
        postId: this.comment.post_id,
        commentId: this.comment.id
      };
      this.store$.dispatch(
        new CommentsStoreActions.DislikeRequestAction(request)
      );
    }

  }

  getProfilePictureClass(index): string {
    return this.commentService.getProfilePictureClass(index);
  }

  invalidLength(): boolean {
    return this.currentLength > this.MAX_COMMENT_LENGTH;
  }

  onFileChanged(event): void {
    this.imageFile = event.target.files[0];
    this.imgSrc = window.URL.createObjectURL(this.imageFile);
  }

  removeFile(): void {
    this.imageFile = null;
    this.imgSrc = null;
  }

  getDisplayFilename(name: string): string {
    if (name.length > this.FILENAME_MAX_SIZE) {
      return name.substr(0, this.FILENAME_MAX_SIZE) + '...';
    } else {
      return name;
    }
  }

  openModal(id: string, data?: any): void {
    if ( data ) {
      this.modalService.open(id, data);
    } else {
      this.modalService.open(id);
    }
  }

  closeModal(id: string): void {
    this.modalService.close(id);
  }

  imageClicked(): void {

    if ( !this.imageBlurred ) {
      this.openModal('spot-image-modal', this.post.image_src);
    } else {
      this.imageBlurred = false;
    }

  }

  openReportModal(postId: string, commentId: string): void {

    if ( !this.authenticationService.isAuthenticated() ) {
      this.modalService.open('spot-auth-modal');
      return;
    }

    this.openModal('spot-report-modal', { postId: postId, commentId: commentId })

  }

}
