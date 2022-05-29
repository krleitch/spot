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

// helpers
import { getFormattedTime } from '@helpers/util';
import {
  checkWordOnCaret,
  parseContentHTML,
  removeWordCreateTag
} from '@helpers/content';

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
import { TagComponent } from '@src/app/components/main/social/tag/tag.component';

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

  @ViewChild('options') options: ElementRef;
  @ViewChild('content') content: ElementRef;
  @ViewChild('reply') reply: ElementRef;

  STRINGS: Record<string, string>;
  eCommentRatingType = CommentRatingType;
  COMMENT_CONSTANTS = COMMENT_CONSTANTS;

  // State
  expanded = false;
  isExpandable = false;
  timeMessage: string;
  showAddReply = false;
  showDropdown = false;
  // lengths
  MAX_COMMENT_LENGTH = 300;
  currentLength = 0;
  // errors
  addReplyError = '';
  addReplyLoading = false;

  // location
  location$: Observable<LocationData>;
  location: LocationData;
  friends$: Observable<Friend[]>;
  friendsList: Friend[] = [];

  // Tags
  @ViewChild('tagContainer') tagContainer: ElementRef;
  @ViewChild('tag') tag: TagComponent;
  showTag = false;
  tagName = '';
  tagElement: Node;
  tagCaretPosition: number;

  replyText: string;

  // Replies
  replies$: Observable<StoreReply>;
  replies: Comment[] = [];
  initialLoad = true;
  loadingReplies = false;
  loadingMoreReplies = false;
  showLoadingRepliesIndicator$: Observable<boolean>;
  totalRepliesAfter = 0;

  // User/Auth/Verify status
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
    this.translateService
      .get('MAIN.COMMENTS')
      .subscribe((res: Record<string, string>) => {
        this.STRINGS = res;
      });
  }

  offClickHandler(event: MouseEvent): void {
    if (this.options && !this.options.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }

    if (this.tag && !this.tagContainer.nativeElement.contains(event.target)) {
      this.showTag = false;
    }

    // Check caret position
    if (this.reply && this.reply.nativeElement.contains(event.target)) {
      this.setTagState();
    }
  }

  ngOnInit(): void {
    // replies
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
              (_errorResponse: { error: SpotError }) => {
                this.loadingReplies = false;
              }
            );
        } else {
          this.initialLoad = false;
        }
      });

    // location
    this.location$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocation)
    );

    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: LocationData) => {
        this.location = location;
      });

    // Authentication / Verification status
    this.isVerified$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsVerified)
    );
    this.isAuthenticated$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsAuthenticated)
    );

    // user
    this.user$ = this.store$.pipe(select(UserStoreSelectors.selectUser));

    this.user$.pipe(takeUntil(this.onDestroy)).subscribe((user) => {
      this.user = user;
    });

    this.userMetadata$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserMetadata)
    );

    // friends
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    this.friends$.pipe(takeUntil(this.onDestroy)).subscribe((friends) => {
      this.friendsList = friends;
    });

    // set time, blur nsfw, and check if content is too large
    this.timeMessage = getFormattedTime(this.comment.createdAt);
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
    // fix pasting content to just strip plaintext content
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
          (_errorResponse: { error: SpotError }) => {
            this.loadingReplies = false;
          }
        );
    }
  }

  onEnter(): boolean {
    // Add tag on enter
    if (this.showTag) {
      this.tag.onEnter();
      return false;
    }
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
    this.setTagState();
  }

  private setTagState() {
    const range = window.getSelection().getRangeAt(0);
    const word = checkWordOnCaret(range);
    if (word) {
      this.tagName = word.slice(1);
      this.showTag = true;
      this.tagElement = range.startContainer;
      this.tagCaretPosition = range.startOffset;
    } else {
      this.tagName = '';
      this.showTag = false;
      this.tagElement = null;
      this.tagCaretPosition = null;
    }
  }

  private setContentHTML(): void {
    this.content.nativeElement.innerHTML = parseContentHTML(
      this.comment.content,
      this.comment.tag.tags,
      this.isExpandable,
      this.expanded
    );
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

    // remove the word and create the tag
    const tagElement = removeWordCreateTag(
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

  toggleShowAddReply(): void {
    this.showAddReply = !this.showAddReply;
    setTimeout(() => {
      if (this.showAddReply === true && this.reply) {
        this.reply.nativeElement.focus({
          preventScroll: true
        });
      }
    }, 100);
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

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
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
