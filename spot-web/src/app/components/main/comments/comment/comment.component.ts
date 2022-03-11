import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// rxjs
import { Observable, Subject, timer } from 'rxjs';
import { mapTo, startWith, take, takeUntil, takeWhile } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  CommentStoreActions,
  CommentStoreSelectors
} from '@src/app/root-store/comment-store';
import { StoreReply } from '@src/app/root-store/comment-store/state';
import { UserStoreSelectors } from '@src/app/root-store/user-store';
import { SocialStoreSelectors } from '@store/social-store';

// Services
import { CommentService } from '@src/app/services/comment.service';
import { ModalService } from '@services/modal.service';
import { AlertService } from '@services/alert.service';
import { AuthenticationService } from '@services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

// Models
import { Friend } from '@models/friend';
import { SpotError } from '@exceptions/error';
import { User } from '@models/user';
import { UserMetadata } from '@models/userMetadata';
import { LocationData } from '@models/location';
import {
  CreateReplyRequest,
  AddReplyStoreRequest,
  CreateReplyResponse,
  Comment,
  DeleteCommentRequest,
  RateCommentRequest,
  GetRepliesRequest,
  GetRepliesResponse,
  SetRepliesStoreRequest,
  CommentRatingType
} from '@models/comment';
import { Spot } from '@models/spot';
import { Tag } from '@models/comment';
import {
  ModalImageData,
  ModalOptions,
  ModalConfirmResult,
  ModalConfirmResultTypes
} from '@models/modal';

// Components
import { TagComponent } from '../../social/tag/tag.component';

// Assets
import { COMMENT_CONSTANTS } from '@constants/comment';

@Component({
  selector: 'spot-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
  private readonly onDestroy = new Subject<void>();

  @Input() detailed: boolean;
  @Input() comment: Comment;
  @Input() spot: Spot;

  @ViewChild('options') options;
  @ViewChild('text') text;
  @ViewChild('reply') reply;

  STRINGS;
  eCommentRatingType = CommentRatingType;
  COMMENT_CONSTANTS = COMMENT_CONSTANTS;

  // For large comments
  expanded = false;
  isExpandable = false;

  location$: Observable<LocationData>;
  location: LocationData;
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
  initialLoad = true;
  loadingReplies = false;
  loadingMoreReplies = false;
  showLoadingRepliesIndicator$: Observable<boolean>;
  totalRepliesAfter = 0;

  isAuthenticated$: Observable<boolean>;
  isVerified$: Observable<boolean>;
  userMetadata$: Observable<UserMetadata>;
  user$: Observable<User>;
  user: User;

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

  constructor(
    private store$: Store<RootStoreState.State>,
    private commentService: CommentService,
    public domSanitizer: DomSanitizer,
    private modalService: ModalService,
    private alertService: AlertService,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService
  ) {
    document.addEventListener('click', this.offClickHandler.bind(this));
    this.translateService.get('MAIN.COMMENTS').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    this.replies$ = this.store$.pipe(
      select(CommentStoreSelectors.selectReplies, {
        spotId: this.comment.spotId,
        commentId: this.comment.parentCommentId
      })
    );

    this.replies$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((storeReply: StoreReply) => {
        this.replies = storeReply.replies;
        this.totalRepliesAfter = storeReply.totalRepliesAfter;

        // only load replies if we have none
        if (this.replies.length === 0 && this.initialLoad) {
          const request: GetRepliesRequest = {
            spotId: this.comment.spotId,
            commentId: this.comment.commentId,
            replyLink: this.spot.startCommentLink || undefined,
            after: undefined,
            limit: this.detailed
              ? COMMENT_CONSTANTS.REPLY_DETAILED_INITIAL_LIMIT
              : COMMENT_CONSTANTS.REPLY_INITIAL_LIMIT
          };

          this.loadingReplies = true;
          this.showLoadingRepliesIndicator$ = timer(1500)
            .pipe(
              mapTo(true),
              takeWhile((_) => this.loadingReplies)
            )
            .pipe(startWith(false));

          this.commentService
            .getReplies(request)
            .pipe(take(1))
            .subscribe(
              (replies: GetRepliesResponse) => {
                const storeRequest: SetRepliesStoreRequest = {
                  spotId: this.comment.spotId,
                  commentId: this.comment.commentId,
                  type: 'initial',
                  replies: replies.replies,
                  totalRepliesAfter: replies.totalRepliesAfter
                };

                this.initialLoad = false;
                this.store$.dispatch(
                  new CommentStoreActions.SetRepliesRequestAction(storeRequest)
                );

                this.totalRepliesAfter = replies.totalRepliesAfter;
                this.loadingReplies = false;
              },
              (err: SpotError) => {
                this.loadingReplies = false;
              }
            );
        } else {
          this.initialLoad = false;
        }
      });

    this.isAuthenticated$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsAuthenticated)
    );

    this.location$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocation)
    );

    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: LocationData) => {
        this.location = location;
      });

    this.isVerified$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsVerified)
    );

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    this.friends$.pipe(takeUntil(this.onDestroy)).subscribe((friends) => {
      this.friendsList = friends;
    });

    // user
    this.user$ = this.store$.pipe(select(UserStoreSelectors.selectUser));

    this.user$.pipe(takeUntil(this.onDestroy)).subscribe((user) => {
      this.user = user;
    });

    this.userMetadata$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserMetadata)
    );

    this.getTime(this.comment.createdAt);
    this.imageBlurred = this.comment.imageNsfw;

    if (
      this.comment.content.split(/\r\n|\r|\n/).length >
        COMMENT_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH ||
      this.comment.content.length > COMMENT_CONSTANTS.MAX_TRUNCATE_LENGTH
    ) {
      this.isExpandable = true;
    }
  }

  ngAfterViewInit(): void {
    this.setContentHTML();
    this.reply.nativeElement.addEventListener('paste', (event: any) => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  ngOnChanges(changes: any): void {
    if (!this.initialLoad) {
      // if detailed load more replies
      const initialLimit = this.detailed ? 10 : 1;

      const request: GetRepliesRequest = {
        spotId: this.comment.spotId,
        commentId: this.comment.commentId,
        replyLink: this.spot.startCommentLink || undefined,
        after: undefined,
        limit: initialLimit
      };

      this.loadingReplies = true;
      this.showLoadingRepliesIndicator$ = timer(1500)
        .pipe(
          mapTo(true),
          takeWhile((val) => this.loadingReplies)
        )
        .pipe(startWith(false));

      this.commentService
        .getReplies(request)
        .pipe(take(1))
        .subscribe(
          (replies: GetRepliesResponse) => {
            const storeRequest: SetRepliesStoreRequest = {
              spotId: this.comment.spotId,
              commentId: this.comment.commentId,
              type: 'initial',
              replies: replies.replies,
              totalRepliesAfter: replies.totalRepliesAfter
            };

            this.initialLoad = false;
            this.store$.dispatch(
              new CommentStoreActions.SetRepliesRequestAction(storeRequest)
            );

            this.totalRepliesAfter = replies.totalRepliesAfter;
            this.loadingReplies = false;
          },
          (err: SpotError) => {
            this.loadingReplies = false;
          }
        );
    }
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
    if (this.showTag) {
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
    if (this.comment.tag.tags.length > 0) {
      this.comment.tag.tags.forEach((tag: Tag) => {
        // check if tag should even be shown
        if (tag.offset <= content.length || this.expanded) {
          // create the span that will hold the tag
          const span = document.createElement('span');
          // fill with text leading up to the tag
          const textBefore = document.createTextNode(
            content.substring(lastOffset, Math.min(tag.offset, content.length))
          );
          // create the tag and give the username
          const inlineTag = document.createElement('span');
          inlineTag.className = 'tag-inline-comment';

          // <span class="material-icons"> person </span>
          if (tag.username) {
            const username = document.createTextNode(
              tag.username ? tag.username : '???'
            );
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
          const textContent = document.createTextNode(
            content.substring(lastOffset)
          );
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
    if (lastOffset < content.length) {
      const after = document.createTextNode(content.substring(lastOffset));
      div.appendChild(after);
    }

    // Add ellipsis if its expandable and isnt expanded
    if (this.isExpandable && !this.expanded) {
      const ellipsis = document.createTextNode(' ...');
      div.appendChild(ellipsis);
    }

    // set the innerHTML
    this.text.nativeElement.innerHTML = div.innerHTML;
  }

  // Returns the content that will be shown and truncates if need be
  getContent(): string {
    if (this.expanded || !this.isExpandable) {
      return this.comment.content;
    }

    const textArrays = this.comment.content.split(/\r\n|\r|\n/);
    let truncatedContent = '';

    for (
      let i = 0;
      i < textArrays.length && i < COMMENT_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH;
      i++
    ) {
      if (
        truncatedContent.length + textArrays[i].length >
        COMMENT_CONSTANTS.MAX_TRUNCATE_LENGTH
      ) {
        truncatedContent = textArrays[i].substring(
          0,
          COMMENT_CONSTANTS.MAX_TRUNCATE_LENGTH - truncatedContent.length
        );
        break;
      } else {
        truncatedContent += textArrays[i];
        // Dont add newline for last line or last line before line length reached
        if (
          i !== textArrays.length - 1 &&
          i !== COMMENT_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH - 1
        ) {
          truncatedContent += '\n';
        }
      }
    }

    return truncatedContent;
  }

  onTextInput(event): void {
    if (event.target.textContent.length === 0) {
      this.reply.nativeElement.innerHTML = '';
    }
    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = Math.max(
      event.target.textContent.length + event.target.childNodes.length - 1,
      0
    );
    this.addReplyError = null;

    // Check for tag
    this.getAndCheckWordOnCaret();
  }

  getAndCheckWordOnCaret(): void {
    const range = window.getSelection().getRangeAt(0);
    if (range.collapsed) {
      if (range.startContainer.parentElement.className === 'tag-inline') {
        range.setStart(range.startContainer.parentElement.nextSibling, 0);
        range.collapse(true);
      } else {
        this.checkWord(
          this.getCurrentWord(range.startContainer, range.startOffset),
          range.startContainer,
          range.startOffset
        );
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
    if (word.length > 1 && word[0] === '@') {
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
    if (
      this.friendsList.find(
        (friend: Friend) => friend.username === username
      ) === undefined
    ) {
      this.alertService.error('Only friends can be tagged');
      return;
    }

    // remove the word
    const tagElement = this.removeWord(
      this.tagElement,
      this.tagCaretPosition,
      username
    );

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
    const beforeText = document.createTextNode(
      content.substring(0, startPosition + 1)
    );
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
    return Math.min(
      this.totalRepliesAfter,
      this.detailed
        ? this.COMMENT_CONSTANTS.REPLY_MORE_LIMIT_DETAILED
        : this.COMMENT_CONSTANTS.REPLY_MORE_LIMIT
    );
  }

  loadMoreReplies(): void {
    if (this.loadingMoreReplies) {
      return;
    }

    const request: GetRepliesRequest = {
      spotId: this.comment.spotId,
      commentId: this.comment.commentId,
      after:
        this.replies.length > 0
          ? this.replies[this.replies.length - 1].commentId
          : undefined,
      limit: this.detailed
        ? this.COMMENT_CONSTANTS.REPLY_MORE_LIMIT_DETAILED
        : this.COMMENT_CONSTANTS.REPLY_MORE_LIMIT
    };

    this.loadingMoreReplies = true;

    this.commentService
      .getReplies(request)
      .pipe(take(1))
      .subscribe(
        (replies: GetRepliesResponse) => {
          const storeRequest: SetRepliesStoreRequest = {
            spotId: this.comment.spotId,
            commentId: this.comment.commentId,
            type: 'after',
            replies: replies.replies,
            totalRepliesAfter: replies.totalRepliesAfter
          };

          this.store$.dispatch(
            new CommentStoreActions.SetRepliesRequestAction(storeRequest)
          );

          this.totalRepliesAfter = replies.totalRepliesAfter;
          this.loadingMoreReplies = false;
        },
        (err: SpotError) => {
          this.loadingMoreReplies = false;
        }
      );
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
      if (secDiff <= 0) {
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
    this.modalService
      .open('global', 'confirm')
      .pipe(take(1))
      .subscribe((result: ModalConfirmResult) => {
        if (result.status === ModalConfirmResultTypes.CONFIRM) {
          const request: DeleteCommentRequest = {
            spotId: this.comment.spotId,
            commentId: this.comment.commentId
          };
          this.store$.dispatch(
            new CommentStoreActions.DeleteRequestAction(request)
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

    while (stack.length > 0) {
      const elem = stack.pop();

      // A tag
      if (elem.className === 'tag-inline') {
        const tag: Tag = {
          username: elem.textContent,
          offset
        };
        tags.push(tag);
        // A tag has no children, continue
        continue;
      }

      // Push the children
      // In reverse because we want to parse the from left to right
      if (elem.childNodes) {
        stack = stack.concat([].slice.call(elem.childNodes, 0).reverse());
      }

      // Don't add spaces to start
      if (elem.tagName === 'DIV') {
        // A new Div
        text += '\n';
        offset += 1;
      } else if (elem.nodeType === 3) {
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

    if (
      content.split(/\r\n|\r|\n/).length > COMMENT_CONSTANTS.MAX_LINE_LENGTH
    ) {
      this.addReplyError = this.STRINGS.ERROR_LINE_LENGTH.replace(
        '%LENGTH%',
        COMMENT_CONSTANTS.MAX_LINE_LENGTH.toString()
      );
      return;
    }

    if (content.length === 0 && !this.imageFile && tags.length === 0) {
      this.addReplyError = this.STRINGS.ERROR_NO_CONTENT;
      return;
    }

    if (content.length < COMMENT_CONSTANTS.MIN_CONTENT_LENGTH) {
      this.addReplyError = this.STRINGS.ERROR_MIN_CONTENT.replace(
        '%MIN%',
        COMMENT_CONSTANTS.MIN_CONTENT_LENGTH.toString()
      );
      return;
    }

    if (content.length > COMMENT_CONSTANTS.MAX_CONTENT_LENGTH) {
      this.addReplyError = this.STRINGS.ERROR_MAX_CONTENT.replace(
        '%MAX%',
        COMMENT_CONSTANTS.MAX_CONTENT_LENGTH.toString()
      );
      return;
    }

    // Only allow ascii characters currently, so check anything but ascii
    // So user knows what they need to change
    // eslint-disable-next-line no-control-regex
    const regex = /^[^\x00-\x7F]*$/;
    const match = content.match(regex);
    if (match && match[0].length > 0) {
      this.addReplyError = this.STRINGS.ERROR_INVALID_CONTENT + match[0];
      return;
    }

    if (!location) {
      this.addReplyError = this.STRINGS.ERROR_LOCATION;
      return;
    }

    // Make the request
    const request: CreateReplyRequest = {
      spotId: this.comment.spotId,
      commentId: this.comment.parentCommentId,
      commentParentId: this.comment.commentId,
      content,
      image: this.imageFile,
      tagsList: tags,
      location: this.location
    };

    this.addReplyLoading = true;

    this.commentService
      .createReply(request)
      .pipe(take(1))
      .subscribe(
        (reply: CreateReplyResponse) => {
          const storeRequest: AddReplyStoreRequest = {
            reply: reply.reply
          };

          this.store$.dispatch(
            new CommentStoreActions.AddReplyRequestAction(storeRequest)
          );

          this.addReplyLoading = false;
          this.removeFile();
          this.reply.nativeElement.innerText = '';
          this.reply.nativeElement.innerHtml = '';
          Array.from(this.reply.nativeElement.children).forEach(
            (c: HTMLElement) => (c.innerHTML = '')
          );
          this.reply.nativeElement.innerHTML = '';
          this.currentLength = 0;
          this.showAddReply = false;
        },
        (createError: SpotError) => {
          this.addReplyLoading = false;
          if (createError.name === 'InvalidCommentProfanity') {
            this.addReplyError = this.STRINGS.ERROR_PROFANITY.replace(
              '%PROFANITY%',
              createError.body.word
            );
          } else {
            this.addReplyError = createError.message;
          }
        }
      );
  }

  setShowAddReply(val: boolean): void {
    this.showAddReply = val;
    setTimeout(() => {
      if (this.showAddReply === true && this.reply) {
        this.reply.nativeElement.focus({
          preventScroll: true
        });
      }
    }, 100);
  }

  like(): void {
    if (!this.authenticationService.isAuthenticated()) {
      this.modalService.open('global', 'auth');
      return;
    }

    if (this.comment.myRating === CommentRatingType.LIKE) {
      const request: RateCommentRequest = {
        spotId: this.comment.spotId,
        commentId: this.comment.commentId,
        rating: CommentRatingType.NONE
      };
      this.store$.dispatch(new CommentStoreActions.RateRequestAction(request));
    } else {
      const request: RateCommentRequest = {
        spotId: this.comment.spotId,
        commentId: this.comment.commentId,
        rating: CommentRatingType.LIKE
      };
      this.store$.dispatch(new CommentStoreActions.RateRequestAction(request));
    }
  }

  dislike(): void {
    if (!this.authenticationService.isAuthenticated()) {
      this.modalService.open('global', 'auth');
      return;
    }

    if (this.comment.myRating === CommentRatingType.DISLIKE) {
      const request: RateCommentRequest = {
        spotId: this.comment.spotId,
        commentId: this.comment.commentId,
        rating: CommentRatingType.NONE
      };
      this.store$.dispatch(new CommentStoreActions.RateRequestAction(request));
    } else {
      const request: RateCommentRequest = {
        spotId: this.comment.spotId,
        commentId: this.comment.commentId,
        rating: CommentRatingType.DISLIKE
      };
      this.store$.dispatch(new CommentStoreActions.RateRequestAction(request));
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

  closeModal(id: string): void {
    this.modalService.close(id);
  }

  imageClicked(): void {
    if (!this.imageBlurred) {
      const modalData: ModalImageData = { imageSrc: this.comment.imageSrc };
      const modalOptions: ModalOptions = { width: 'auto' };
      this.modalService.open('global', 'image', modalData, modalOptions);
    } else {
      this.imageBlurred = false;
    }
  }

  openReportModal(spotId: string, commentId: string): void {
    if (!this.authenticationService.isAuthenticated()) {
      this.modalService.open('global', 'auth');
      return;
    }

    this.modalService.open('global', 'report', {
      spotId: spotId,
      commentId: commentId
    });
  }

  openShareModal(
    spotId: string,
    spotLink: string,
    commentId: string,
    commentLink: string
  ) {
    if (!this.authenticationService.isAuthenticated()) {
      this.modalService.open('global', 'auth');
      return;
    }

    this.modalService.open('global', 'share', {
      spotId: spotId,
      commentId: commentId,
      spotLink: spotLink,
      commentLink: commentLink
    });
  }
}
