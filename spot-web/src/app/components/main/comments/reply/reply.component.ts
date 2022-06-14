import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  CommentStoreActions,
  CommentStoreSelectors
} from '@src/app/root-store/comment-store';
import { UserStoreSelectors } from '@src/app/root-store/user-store';
import { SocialStoreSelectors } from '@store/social-store';

// Services
import { AlertService } from '@services/alert.service';
import { CommentService } from '@src/app/services/comment.service';
import { ModalService } from '@services/modal.service';
import { AuthenticationService } from '@services/authentication.service';
import { TranslateService } from '@ngx-translate/core';

// helpers
import { getFormattedTime } from '@helpers/util';
import {
  checkWordOnCaret,
  parseContentHTML,
  removeWordCreateTag,
  parseContentWithTags
} from '@helpers/content';

// Models
import {
  CreateReplyRequest,
  AddReplyStoreRequest,
  CreateReplyResponse,
  Comment,
  DeleteReplyRequest,
  RateReplyRequest,
  CommentRatingType
} from '@models/comment';
import { Spot } from '@models/spot';
import { Friend } from '@models/friend';
import { SpotError } from '@exceptions/error';
import { User, UserRole } from '@models/user';
import { UserMetadata } from '@models/userMetadata';
import { LocationData } from '@models/location';
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
  selector: 'spot-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.scss']
})
export class ReplyComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  @Input() detailed: boolean; // show more information on its own page
  @Input() reply: Comment;
  @Input() comment: Comment;
  @Input() spot: Spot;

  @ViewChild('options') options;
  @ViewChild('content') content;
  @ViewChild('reply2') reply2;

  @ViewChild('tagContainer') tagContainer: ElementRef;
  @ViewChild('tag') tag: TagComponent;
  showTag = false;
  tagName = '';
  tagElement: Node;
  tagCaretPosition: number;
  tagged$: Observable<boolean>;
  tagged: boolean; // Was the user tagged in the comment chain

  location$: Observable<LocationData>;
  location: LocationData;
  friends$: Observable<Friend[]>;
  friendsList: Friend[] = [];

  STRINGS: Record<string, string>;
  eCommentRatingType = CommentRatingType;
  eUserRole = UserRole;
  COMMENT_CONSTANTS = COMMENT_CONSTANTS;

  isAuthenticated$: Observable<boolean>;
  isAuthenticated: boolean;
  isVerified$: Observable<boolean>;
  isVerified: boolean;
  userMetadata$: Observable<UserMetadata>;
  user$: Observable<User>;
  user: User;

  // For large replies
  expanded = false;
  isExpandable = false;

  reply2Text: string;
  addReply2Error: string;
  addReply2Loading = false;

  imageFile: File;
  imgSrc: string = null;
  imageBlurred: boolean; // if content flagged nsfw

  // displaying used characters for add reply
  currentLength = 0;

  timeMessage: string;
  showAddReply = false;
  showDropdown = false;

  constructor(
    private store$: Store<RootStoreState.State>,
    private commentService: CommentService,
    public domSanitizer: DomSanitizer,
    private modalService: ModalService,
    private alertService: AlertService,
    private authenticationService: AuthenticationService,
    private TranslateService: TranslateService
  ) {
    document.addEventListener('click', this.offClickHandler.bind(this));
    this.TranslateService.get('MAIN.REPLY').subscribe(
      (strings: Record<string, string>) => {
        this.STRINGS = strings;
      }
    );
  }

  offClickHandler(event: MouseEvent): void {
    if (this.options && !this.options.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }

    if (this.tag && !this.tagContainer.nativeElement.contains(event.target)) {
      this.showTag = false;
    }

    if (this.reply2 && this.reply2.nativeElement.contains(event.target)) {
      this.setTagState();
    }
  }
  ngOnInit(): void {
    // Authentication / Verification status
    this.isVerified$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsVerified)
    );
    this.isVerified$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((verified: boolean) => {
        this.isVerified = verified;
      });
    this.isAuthenticated$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsAuthenticated)
    );
    this.isAuthenticated$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((authenticated: boolean) => {
        this.isAuthenticated = authenticated;
      });

    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    this.friends$.pipe(takeUntil(this.onDestroy)).subscribe((friends) => {
      this.friendsList = friends;
    });

    this.location$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocation)
    );

    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: LocationData) => {
        this.location = location;
      });

    // user
    this.user$ = this.store$.pipe(select(UserStoreSelectors.selectUser));

    this.user$.pipe(takeUntil(this.onDestroy)).subscribe((user) => {
      this.user = user;
    });

    this.userMetadata$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserMetadata)
    );

    this.tagged$ = this.store$.pipe(
      select(CommentStoreSelectors.selectTagged, {
        spotId: this.comment.spotId,
        commentId: this.comment.commentId
      })
    );

    this.tagged$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((tagged: boolean) => {
        this.tagged = tagged;
      });

    this.timeMessage = getFormattedTime(this.reply.createdAt);
    this.imageBlurred = this.reply.imageNsfw;

    if (
      this.reply.content.split(/\r\n|\r|\n/).length >
        COMMENT_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH ||
      this.reply.content.length > COMMENT_CONSTANTS.MAX_TRUNCATE_LENGTH
    ) {
      this.isExpandable = true;
    }
  }

  ngAfterViewInit(): void {
    this.setContentHTML();
    this.reply2.nativeElement.addEventListener('paste', (event: any) => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  onEnter(): boolean {
    // Add tag on enter
    if (this.showTag) {
      this.tag.onEnter();
      return false;
    }
  }

  onTextInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.textContent.length === 0) {
      this.reply2.nativeElement.innerHTML = '';
    }
    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = Math.max(
      target.textContent.length + target.childNodes.length - 1,
      0
    );
    this.addReply2Error = null;
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

    // remove the word
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
      if (this.showAddReply === true && this.reply2) {
        this.reply2.nativeElement.focus({
          preventScroll: true
        });
      }
    }, 100);
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  deleteReply(): void {
    this.modalService
      .open('global', 'confirm')
      .pipe(take(1))
      .subscribe((result: ModalConfirmResult) => {
        if (result.status === ModalConfirmResultTypes.CONFIRM) {
          const request: DeleteReplyRequest = {
            spotId: this.reply.spotId,
            commentId: this.reply.parentCommentId,
            replyId: this.reply.commentId
          };
          this.store$.dispatch(
            new CommentStoreActions.DeleteReplyRequestAction(request)
          );
        }
      });
  }

  addReply(): void {
    const contentAndTags = parseContentWithTags(
      this.reply2.nativeElement.innerHTML
    );
    const content = contentAndTags.content;
    const tags = contentAndTags.tags;

    // Error checking
    if (
      content.split(/\r\n|\r|\n/).length > COMMENT_CONSTANTS.MAX_LINE_LENGTH
    ) {
      this.addReply2Error = this.STRINGS.ERROR_LINE_LENGTH.replace(
        '%LENGTH%',
        COMMENT_CONSTANTS.MAX_LINE_LENGTH.toString()
      );
      return;
    }

    if (content.length === 0 && !this.imageFile && tags.length === 0) {
      this.addReply2Error = this.STRINGS.ERROR_NO_CONTENT;
      return;
    }

    if (content.length < COMMENT_CONSTANTS.MIN_CONTENT_LENGTH) {
      this.addReply2Error = this.STRINGS.ERROR_MIN_CONTENT.replace(
        '%MIN%',
        COMMENT_CONSTANTS.MIN_CONTENT_LENGTH.toString()
      );
      return;
    }

    if (content.length > COMMENT_CONSTANTS.MAX_CONTENT_LENGTH) {
      this.addReply2Error = this.STRINGS.ERROR_MAX_CONTENT.replace(
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
      this.addReply2Error = this.STRINGS.ERROR_INVALID_CONTENT + match[0];
      return;
    }

    if (!location) {
      this.addReply2Error = this.STRINGS.ERROR_LOCATION;
      return;
    }

    // Make the request
    const request: CreateReplyRequest = {
      spotId: this.reply.spotId,
      commentId: this.reply.parentCommentId,
      content,
      image: this.imageFile,
      tagsList: tags,
      location: this.location
    };

    this.addReply2Loading = true;

    this.commentService
      .createReply(request)
      .pipe(take(1))
      .subscribe(
        (r: CreateReplyResponse) => {
          const storeRequest: AddReplyStoreRequest = {
            reply: r.reply
          };

          this.store$.dispatch(
            new CommentStoreActions.AddReplyRequestAction(storeRequest)
          );

          this.addReply2Loading = false;
          this.removeFile();
          this.reply2.nativeElement.innerText = '';
          this.reply2.nativeElement.innerHtml = '';
          Array.from(this.reply2.nativeElement.children).forEach(
            (c: HTMLElement) => (c.innerHTML = '')
          );
          this.reply2.nativeElement.innerHTML = '';
          this.currentLength = 0;
          this.showAddReply = false;
        },
        (createError: SpotError) => {
          this.addReply2Loading = false;
          if (createError.name === 'InvalidCommentProfanity') {
            this.addReply2Error = this.STRINGS.ERROR_PROFANITY.replace(
              '%PROFANITY%',
              createError.body.word
            );
          } else {
            this.addReply2Error = createError.message;
          }
        }
      );
  }

  like(): void {
    if (!this.authenticationService.isAuthenticated()) {
      this.modalService.open('global', 'auth');
      return;
    }

    if (this.reply.myRating === CommentRatingType.LIKE) {
      const request: RateReplyRequest = {
        spotId: this.reply.spotId,
        commentId: this.reply.parentCommentId,
        replyId: this.reply.commentId,
        rating: CommentRatingType.NONE
      };
      this.store$.dispatch(
        new CommentStoreActions.RateReplyRequestAction(request)
      );
    } else {
      const request: RateReplyRequest = {
        spotId: this.reply.spotId,
        commentId: this.reply.parentCommentId,
        replyId: this.reply.commentId,
        rating: CommentRatingType.LIKE
      };
      this.store$.dispatch(
        new CommentStoreActions.RateReplyRequestAction(request)
      );
    }
  }

  dislike(): void {
    if (!this.authenticationService.isAuthenticated()) {
      this.modalService.open('global', 'auth');
      return;
    }

    if (this.reply.myRating === CommentRatingType.DISLIKE) {
      const request: RateReplyRequest = {
        spotId: this.reply.spotId,
        commentId: this.reply.parentCommentId,
        replyId: this.reply.commentId,
        rating: CommentRatingType.NONE
      };
      this.store$.dispatch(
        new CommentStoreActions.RateReplyRequestAction(request)
      );
    } else {
      const request: RateReplyRequest = {
        spotId: this.reply.spotId,
        commentId: this.reply.parentCommentId,
        replyId: this.reply.commentId,
        rating: CommentRatingType.DISLIKE
      };
      this.store$.dispatch(
        new CommentStoreActions.RateReplyRequestAction(request)
      );
    }
  }

  // Images
  onFileChanged(event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length) {
      this.imageFile = target.files[0];
      this.imgSrc = window.URL.createObjectURL(this.imageFile);
    }
  }

  removeFile(): void {
    this.imageFile = null;
    this.imgSrc = null;
  }

  closeModal(id: string): void {
    this.modalService.close(id);
  }

  imageClicked(): void {
    if (!this.imageBlurred) {
      const modalData: ModalImageData = { imageSrc: this.reply.imageSrc };
      const modalOptions: ModalOptions = { width: 'auto' };
      this.modalService.open('global', 'image', modalData, modalOptions);
    } else {
      this.imageBlurred = false;
    }
  }

  // Modals
  openReportModal(): void {
    if (!this.authenticationService.isAuthenticated()) {
      this.modalService.open('global', 'auth');
      return;
    }

    this.modalService.open('global', 'report', {
      spotId: this.spot.spotId,
      commentId: this.reply.commentId
    });
  }

  openShareModal() {
    if (!this.authenticationService.isAuthenticated()) {
      this.modalService.open('global', 'auth');
      return;
    }

    this.modalService.open('global', 'share', {
      spotId: this.spot.spotId,
      commentId: this.reply.commentId,
      spotLink: this.spot.link,
      commentLink: this.reply.link
    });
  }
}
