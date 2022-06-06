import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
  SimpleChanges
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// rxjs
import { Observable, Subject, timer } from 'rxjs';
import {
  mapTo,
  startWith,
  take,
  takeUntil,
  takeWhile,
  finalize
} from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import {
  CommentStoreActions,
  CommentStoreSelectors
} from '@src/app/root-store/comment-store';
import { StoreComment } from '@src/app/root-store/comment-store/state';
import { UserStoreSelectors } from '@src/app/root-store/user-store';
import { SocialStoreSelectors } from '@store/social-store';

// Services
import { CommentService } from '@src/app/services/comment.service';
import { AlertService } from '@services/alert.service';
import { TranslateService } from '@ngx-translate/core';

// Helpers
import {
  checkWordOnCaret,
  removeWordCreateTag,
  parseContentWithTags
} from '@helpers/content';

// Models
import {
  Comment,
  CreateCommentRequest,
  AddCommentStoreRequest,
  CreateCommentResponse,
  GetCommentsRequest,
  GetCommentsResponse,
  SetCommentsStoreRequest
} from '@models/comment';
import { Spot } from '@models/spot';
import { Friend } from '@models/friend';
import { SpotError } from '@exceptions/error';
import { User } from '@models/user';
import { LocationData } from '@models/location';

// Components
import { TagComponent } from '@src/app/components/main/social/tag/tag.component';

// Assets
import { COMMENT_CONSTANTS } from '@constants/comment';

@Component({
  selector: 'spot-comments-container',
  templateUrl: './comments-container.component.html',
  styleUrls: ['./comments-container.component.scss']
})
export class CommentsContainerComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit
{
  private readonly onDestroy = new Subject<void>();

  @Input() detailed: boolean;
  @Input() spot: Spot;

  @ViewChild('comment') comment: ElementRef;
  currentLength = 0;
  refreshed = false;
  addCommentLoading = false;
  addCommentError: string;

  @ViewChild('tagContainer') tag: ElementRef;
  @ViewChild('tag') tagelem: TagComponent;
  showTag = false;
  showTagBottom = false;
  tagName = '';
  tagElement: Node;
  tagCaretPosition: number;

  comments$: Observable<StoreComment>;
  comments: Array<Comment> = [];
  totalCommentsBefore = 0;
  totalCommentsAfter = 0;
  showLoadingCommentsIndicator$: Observable<boolean>;
  loadingCommentsBefore = false;
  loadingCommentsAfter = false;
  initialLoad = true;

  location$: Observable<LocationData>;
  location: LocationData;
  friends$: Observable<Friend[]>;
  friends: Friend[] = [];

  isAuthenticated$: Observable<boolean>;
  isAuthenticated: boolean;
  isVerified$: Observable<boolean>;
  isVerified: boolean;
  user$: Observable<User>;
  user: User;

  imageFile: File;
  imgSrc: string = null;

  STRINGS: Record<string, string>;
  COMMENT_CONSTANTS = COMMENT_CONSTANTS;

  constructor(
    private store$: Store<RootStoreState.State>,
    private alertService: AlertService,
    public domSanitizer: DomSanitizer,
    public commentService: CommentService,
    private translateService: TranslateService
  ) {
    document.addEventListener('click', this.offClickHandler.bind(this));
    this.translateService
      .get('MAIN.COMMENTS_CONTAINER')
      .subscribe((strings: Record<string, string>) => {
        this.STRINGS = strings;
      });
  }

  offClickHandler(event: MouseEvent): void {
    if (this.tag && !this.tag.nativeElement.contains(event.target)) {
      this.showTag = false;
    }

    if (this.comment && this.comment.nativeElement.contains(event.target)) {
      this.setTagState();
    }
  }

  ngOnInit(): void {
    // Comments
    this.comments$ = this.store$.pipe(
      select(CommentStoreSelectors.selectComments, {
        spotId: this.spot.spotId
      })
    );

    this.comments$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((storeComments: StoreComment) => {
        // comments were reset

        this.comments = storeComments.comments;
        this.totalCommentsAfter = storeComments.totalCommentsAfter;
        this.totalCommentsBefore = storeComments.totalCommentsBefore;

        // only load comments if we havent already
        if (this.comments.length === 0 && this.initialLoad) {
          // if detailed load more comments
          const initialLimit = this.detailed
            ? COMMENT_CONSTANTS.DETAILED_INITIAL_LIMIT
            : COMMENT_CONSTANTS.INITIAL_LIMIT;

          // Get the latest initialLimit of comments
          const request: GetCommentsRequest = {
            spotId: this.spot.spotId,
            after:
              this.comments.length > 0
                ? this.comments[this.comments.length - 1].commentId
                : undefined,
            limit: initialLimit,
            commentLink: this.spot.startCommentLink || null
          };

          this.loadingCommentsBefore = true;
          this.showLoadingCommentsIndicator$ = timer(500)
            .pipe(
              mapTo(true),
              takeWhile((_) => this.loadingCommentsBefore)
            )
            .pipe(startWith(false));

          this.commentService
            .getComments(request)
            .pipe(take(1))
            .subscribe(
              (comments: GetCommentsResponse) => {
                this.loadingCommentsBefore = false;
                if (comments.comments) {
                  const storeRequest: SetCommentsStoreRequest = {
                    spotId: this.spot.spotId,
                    type: 'initial',
                    comments: comments.comments,
                    totalCommentsBefore: comments.totalCommentsBefore,
                    totalCommentsAfter: comments.totalCommentsAfter
                  };
                  this.initialLoad = false;
                  this.store$.dispatch(
                    new CommentStoreActions.SetCommentsRequestAction(
                      storeRequest
                    )
                  );
                  this.totalCommentsBefore = comments.totalCommentsBefore;
                  this.totalCommentsAfter = comments.totalCommentsAfter;
                }
              },
              (err: SpotError) => {
                // Ignore error case for now
                this.loadingCommentsBefore = false;
              }
            );
        } else {
          this.initialLoad = false;
        }
      });

    this.user$ = this.store$.pipe(select(UserStoreSelectors.selectUser));

    this.user$.pipe(takeUntil(this.onDestroy)).subscribe((user: User) => {
      this.user = user;
    });

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

    this.location$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocation)
    );

    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: LocationData) => {
        this.location = location;
      });

    // Friends
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    this.friends$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((friends: Friend[]) => {
        this.friends = friends;
      });
  }

  ngAfterViewInit(): void {
    this.comment.nativeElement.addEventListener('paste', (event: any) => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (!this.initialLoad) {
      // Get the latest comments
      const request: GetCommentsRequest = {
        spotId: this.spot.spotId,
        before:
          this.comments.length > 0 ? this.comments[0].commentId : undefined,
        limit: this.detailed
          ? COMMENT_CONSTANTS.DETAILED_INITIAL_LIMIT
          : COMMENT_CONSTANTS.INITIAL_LIMIT,
        commentLink: this.spot.startCommentLink || undefined
      };
      this.loadingCommentsBefore = true;
      this.showLoadingCommentsIndicator$ = timer(500)
        .pipe(
          mapTo(true),
          takeWhile((_) => this.loadingCommentsBefore)
        )
        .pipe(startWith(false));
      this.commentService
        .getComments(request)
        .pipe(take(1))
        .subscribe(
          (comments: GetCommentsResponse) => {
            this.loadingCommentsBefore = false;
            if (comments.comments) {
              const storeRequest: SetCommentsStoreRequest = {
                spotId: this.spot.spotId,
                type: 'before',
                comments: comments.comments,
                totalCommentsBefore: comments.totalCommentsBefore,
                totalCommentsAfter: comments.totalCommentsAfter
              };
              this.initialLoad = false;
              this.store$.dispatch(
                new CommentStoreActions.SetCommentsRequestAction(storeRequest)
              );
              this.totalCommentsBefore = comments.totalCommentsBefore;
              this.totalCommentsAfter = comments.totalCommentsAfter;
            }
          },
          (_err: SpotError) => {
            // Ignore error case for now
            this.loadingCommentsBefore = false;
          }
        );
    }
  }

  showTagTrue(): void {
    const distanceToTop = this.tag.nativeElement.getBoundingClientRect().top;

    if (distanceToTop < 200) {
      this.showTagBottom = true;
    } else {
      this.showTagBottom = false;
    }

    this.showTag = true;
  }

  onTextInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    // delete inner content editable items that are now empty
    if (target.textContent.length === 0) {
      this.comment.nativeElement.innerHTML = '';
    }
    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = Math.max(
      target.textContent.length + target.childNodes.length - 1,
      0
    );
    this.addCommentError = null;

    // Check for tag
    this.setTagState();
  }

  onEnter(): boolean {
    // Add tag on enter
    if (this.showTag) {
      this.tagelem.onEnter();
      return false;
    }
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

  addTag(username: string): void {
    // Check if they are your friend
    if (
      this.friends.find((friend: Friend) => friend.username === username) ===
      undefined
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

  addComment(): void {
    const contentAndTags = parseContentWithTags(
      this.comment.nativeElement.innerHTML
    );
    const content = contentAndTags.content;
    const tags = contentAndTags.tags;

    if (
      content.split(/\r\n|\r|\n/).length > COMMENT_CONSTANTS.MAX_LINE_LENGTH
    ) {
      this.addCommentError = this.STRINGS.ERROR_LINE_LENGTH.replace(
        '%LENGTH%',
        COMMENT_CONSTANTS.MAX_LINE_LENGTH.toString()
      );
      return;
    }

    if (content.length === 0 && !this.imageFile && tags.length === 0) {
      this.addCommentError = this.STRINGS.ERROR_NO_CONTENT;
      return;
    }

    if (content.length < COMMENT_CONSTANTS.MIN_CONTENT_LENGTH) {
      this.addCommentError = this.STRINGS.ERROR_MIN_CONTENT.replace(
        '%MIN%',
        COMMENT_CONSTANTS.MIN_CONTENT_LENGTH.toString()
      );
      return;
    }

    if (content.length > COMMENT_CONSTANTS.MAX_CONTENT_LENGTH) {
      this.addCommentError = this.STRINGS.ERROR_MAX_CONTENT.replace(
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
      this.addCommentError = this.STRINGS.ERROR_INVALID_CONTENT + match[0];
      return;
    }

    if (!location) {
      this.addCommentError = this.STRINGS.ERROR_LOCATION;
      return;
    }

    // Make the request
    const request: CreateCommentRequest = {
      spotId: this.spot.spotId,
      content,
      image: this.imageFile,
      tagsList: tags,
      location: this.location
    };

    this.addCommentLoading = true;

    this.commentService
      .createComment(request)
      .pipe(
        take(1),
        finalize(() => {
          this.addCommentLoading = false;
        })
      )
      .subscribe(
        (response: CreateCommentResponse) => {
          const storeRequest: AddCommentStoreRequest = {
            comment: response.comment
          };

          this.store$.dispatch(
            new CommentStoreActions.AddCommentRequestAction(storeRequest)
          );

          this.removeFile();
          this.comment.nativeElement.innerText = '';
          this.comment.nativeElement.innerHtml = '';
          Array.from(this.comment.nativeElement.children).forEach(
            (c: HTMLElement) => (c.innerHTML = '')
          );
          this.currentLength = 0;
        },
        (errorResponse: { error: SpotError }) => {
          if (errorResponse.error.name === 'InvalidCommentProfanity') {
            this.addCommentError = this.STRINGS.ERROR_PROFANITY.replace(
              '%PROFANITY%',
              errorResponse.error.body.word
            );
          } else {
            this.addCommentError = errorResponse.error.message;
          }
        }
      );
  }

  loadRecentCommentsNum(): number {
    return Math.min(
      this.totalCommentsAfter,
      this.detailed
        ? this.COMMENT_CONSTANTS.RECENT_LIMIT_DETAILED
        : this.COMMENT_CONSTANTS.RECENT_LIMIT
    );
  }

  loadRecentComments(): void {
    if (this.loadingCommentsAfter) {
      return;
    }
    const request: GetCommentsRequest = {
      spotId: this.spot.spotId,
      before: this.comments.length > 0 ? this.comments[0].commentId : undefined,
      limit: this.detailed
        ? COMMENT_CONSTANTS.MORE_LIMIT_DETAILED
        : COMMENT_CONSTANTS.MORE_LIMIT
    };

    this.loadingCommentsAfter = true;
    this.refreshed = false;

    this.commentService
      .getComments(request)
      .pipe(
        take(1),
        finalize(() => {
          this.loadingCommentsAfter = false;
        })
      )
      .subscribe(
        (response: GetCommentsResponse) => {
          if (response.comments) {
            const storeRequest: SetCommentsStoreRequest = {
              spotId: this.spot.spotId,
              type: 'before',
              comments: response.comments,
              totalCommentsAfter: response.totalCommentsAfter
            };
            this.store$.dispatch(
              new CommentStoreActions.SetCommentsRequestAction(storeRequest)
            );

            // Nothing new was found
            // this has to go before totalCommentsAfter is updated
            if (response.totalCommentsAfter === 0) {
              this.refreshed = true;
            }

            this.totalCommentsAfter = response.totalCommentsAfter;
          }
        },
        (_errorResponse: { error: SpotError }) => {}
      );
  }

  loadMoreCommentsNum(): number {
    return Math.min(
      this.totalCommentsBefore,
      this.detailed
        ? this.COMMENT_CONSTANTS.MORE_LIMIT_DETAILED
        : this.COMMENT_CONSTANTS.MORE_LIMIT
    );
  }

  loadMoreComments(): void {
    if (this.loadingCommentsBefore) {
      return;
    }

    const request: GetCommentsRequest = {
      spotId: this.spot.spotId,
      after:
        this.comments.length > 0
          ? this.comments[this.comments.length - 1].commentId
          : undefined,
      limit: this.detailed
        ? COMMENT_CONSTANTS.MORE_LIMIT_DETAILED
        : COMMENT_CONSTANTS.MORE_LIMIT
    };

    this.loadingCommentsBefore = true;

    this.commentService
      .getComments(request)
      .pipe(
        take(1),
        finalize(() => {
          this.loadingCommentsBefore = false;
        })
      )
      .subscribe(
        (response: GetCommentsResponse) => {
          if (response.comments) {
            const storeRequest: SetCommentsStoreRequest = {
              spotId: this.spot.spotId,
              type: 'after',
              comments: response.comments,
              totalCommentsBefore: response.totalCommentsBefore
            };
            this.store$.dispatch(
              new CommentStoreActions.SetCommentsRequestAction(storeRequest)
            );
            this.totalCommentsBefore = response.totalCommentsBefore;
          }
        },
        (_errorResponse: { error: SpotError }) => {
          // Error case
        }
      );
  }

  // Images
  onFileChanged(event: Event): void {
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

  scrollToComment(): void {
    const yOffset = -100;
    const y =
      this.comment.nativeElement.getBoundingClientRect().top +
      window.pageYOffset +
      yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
    this.comment.nativeElement.focus({
      preventScroll: true
    });
  }
}
