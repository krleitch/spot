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
import { StoreComment } from '@src/app/root-store/comment-store/state';
import { UserStoreSelectors } from '@src/app/root-store/user-store';
import { SocialStoreSelectors } from '@store/social-store';

// Services
import { CommentService } from '@src/app/services/comment.service';
import { AlertService } from '@services/alert.service';
import { TranslateService } from '@ngx-translate/core';

// Models
import {
  CreateCommentRequest,
  AddCommentStoreRequest,
  CreateCommentResponse,
  GetCommentsRequest,
  GetCommentsResponse,
  SetCommentsStoreRequest
} from '@models/../newModels/comment';
import { Tag } from '@models/notifications';
import { Spot } from '@models/../newModels/spot';
import { Friend } from '@models/../newModels/friend';
import { SpotError } from '@exceptions/error';
import { User } from '@models/../newModels/user';
import { LocationData } from '@models/../newModels/location';

// Components
import { TagComponent } from '../../social/tag/tag.component';

// Assets
import { COMMENTS_CONSTANTS } from '@constants/comments';

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
  showLoadingCommentsIndicator$: Observable<boolean>;
  loadingCommentsBefore = false;
  loadingCommentsAfter = false;
  refreshed = false;
  addCommentLoading = false;
  addCommentError: string;

  location$: Observable<LocationData>;
  location: LocationData;
  friends$: Observable<Friend[]>;
  friends: Friend[] = [];

  initialLoad = true;

  isAuthenticated$: Observable<boolean>;
  isVerified$: Observable<boolean>;
  user$: Observable<User>;
  user: User;

  imageFile: File;
  imgSrc: string = null;

  STRINGS;
  COMMENTS_CONSTANTS = COMMENTS_CONSTANTS;

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
      .subscribe((res: any) => {
        this.STRINGS = res;
      });
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
            ? COMMENTS_CONSTANTS.DETAILED_INITIAL_LIMIT
            : COMMENTS_CONSTANTS.INITIAL_LIMIT;

          // Get the latest initialLimit of comments
          const request: GetCommentsRequest = {
            spotId: this.spot.spotId,
            after: new Date().toString(),
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
                    type: 'before',
                    initialLoad: true,
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

    // Authentication
    this.isAuthenticated$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsAuthenticated)
    );

    // Verified
    this.isVerified$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsVerified)
    );

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
    if (this.comment) {
      this.comment.nativeElement.addEventListener('paste', (event: any) => {
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      });
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  ngOnChanges(changes: any): void {
    if (!this.initialLoad) {
      // if detailed load more comments
      const initialLimit = this.detailed
        ? COMMENTS_CONSTANTS.DETAILED_INITIAL_LIMIT
        : COMMENTS_CONSTANTS.INITIAL_LIMIT;

      // Get the latest initialLimit of comments
      const request: GetCommentsRequest = {
        spotId: this.spot.spotId,
        after: new Date().toString(),
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
                type: 'before',
                initialLoad: true,
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
          (err: SpotError) => {
            // Ignore error case for now
            this.loadingCommentsBefore = false;
          }
        );
    }
  }

  offClickHandler(event: MouseEvent): void {
    if (this.tag && !this.tag.nativeElement.contains(event.target)) {
      this.hideTag();
    }

    if (this.comment && this.comment.nativeElement.contains(event.target)) {
      this.getAndCheckWordOnCaret();
    }
  }

  onTextInput(event): void {
    if (event.target.textContent.length === 0) {
      this.comment.nativeElement.innerHTML = '';
    }
    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = Math.max(
      event.target.textContent.length + event.target.childNodes.length - 1,
      0
    );
    this.addCommentError = null;
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
    if (word.length > 1 && word[0] === '@') {
      this.tagName = word.slice(1);
      this.showTagTrue();
      this.tagElement = element;
      this.tagCaretPosition = position;
    } else {
      this.hideTag();
      this.tagElement = null;
      this.tagCaretPosition = null;
    }
  }

  // Creates the inline tag and removes the word
  private removeWord(
    element: Node,
    position: number,
    username: string
  ): HTMLElement {
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

  onEnter(): boolean {
    // Add tag on enter
    if (this.showTag) {
      this.tagelem.onEnter();
      return false;
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

    // remove the word, and add the inline tag
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
    this.hideTag();
    this.tagElement = null;
    this.tagCaretPosition = null;
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

    while (stack.length > 0) {
      const elem = stack.pop();

      // A tag
      if (elem.className === 'tag-inline') {
        const tag: Tag = {
          username: elem.textContent,
          postLink: this.spot.link,
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
      content.split(/\r\n|\r|\n/).length > COMMENTS_CONSTANTS.MAX_LINE_LENGTH
    ) {
      this.addCommentError = this.STRINGS.ERROR_LINE_LENGTH.replace(
        '%LENGTH%',
        COMMENTS_CONSTANTS.MAX_LINE_LENGTH.toString()
      );
      return;
    }

    if (content.length === 0 && !this.imageFile && tags.length === 0) {
      this.addCommentError = this.STRINGS.ERROR_NO_CONTENT;
      return;
    }

    if (content.length < COMMENTS_CONSTANTS.MIN_CONTENT_LENGTH) {
      this.addCommentError = this.STRINGS.ERROR_MIN_CONTENT.replace(
        '%MIN%',
        COMMENTS_CONSTANTS.MIN_CONTENT_LENGTH.toString()
      );
      return;
    }

    if (content.length > COMMENTS_CONSTANTS.MAX_CONTENT_LENGTH) {
      this.addCommentError = this.STRINGS.ERROR_MAX_CONTENT.replace(
        '%MAX%',
        COMMENTS_CONSTANTS.MAX_CONTENT_LENGTH.toString()
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
      .pipe(take(1))
      .subscribe(
        (response: CreateCommentResponse) => {
          const storeRequest: AddCommentStoreRequest = {
            comment: response.comment
          };

          this.store$.dispatch(
            new CommentStoreActions.AddCommentRequestAction(storeRequest)
          );

          this.addCommentLoading = false;
          this.removeFile();
          this.comment.nativeElement.innerText = '';
          this.comment.nativeElement.innerHtml = '';
          Array.from(this.comment.nativeElement.children).forEach(
            (c: HTMLElement) => (c.innerHTML = '')
          );
          this.currentLength = 0;
        },
        (createError: SpotError) => {
          this.addCommentLoading = false;
          if (createError.name === 'InvalidCommentProfanity') {
            this.addCommentError = this.STRINGS.ERROR_PROFANITY.replace(
              '%PROFANITY%',
              createError.body.word
            );
          } else {
            this.addCommentError = createError.message;
          }
        }
      );
  }

  loadRecentCommentsNum(): number {
    return Math.min(
      this.totalCommentsAfter,
      this.detailed
        ? this.COMMENTS_CONSTANTS.RECENT_LIMIT_DETAILED
        : this.COMMENTS_CONSTANTS.RECENT_LIMIT
    );
  }

  loadRecentComments(): void {
    if (this.loadingCommentsAfter) {
      return;
    }

    const limit = COMMENTS_CONSTANTS.RECENT_LIMIT;

    const request: GetCommentsRequest = {
      spotId: this.spot.spotId,
      after: this.comments.length > 0 ? this.comments[0].creation_date : null,
      limit
    };

    this.loadingCommentsAfter = true;
    this.refreshed = false;

    this.commentService
      .getComments(request)
      .pipe(take(1))
      .subscribe(
        (response: GetCommentsResponse) => {
          this.loadingCommentsAfter = false;
          if (response.comments) {
            const storeRequest: SetCommentsStoreRequest = {
              spotId: this.spot.spotId,
              type: 'after',
              initialLoad: this.initialLoad,
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
        (err: SpotError) => {
          // Error case
          this.loadingCommentsAfter = false;
        }
      );
  }

  loadMoreCommentsNum(): number {
    return Math.min(
      this.totalCommentsBefore,
      this.detailed
        ? this.COMMENTS_CONSTANTS.MORE_LIMIT_DETAILED
        : this.COMMENTS_CONSTANTS.MORE_LIMIT
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
          ? this.comments.slice(-1).pop().creation_date
          : new Date().toString(),
      limit: this.detailed
        ? COMMENTS_CONSTANTS.MORE_LIMIT_DETAILED
        : COMMENTS_CONSTANTS.MORE_LIMIT
    };

    this.loadingCommentsBefore = true;

    this.commentService
      .getComments(request)
      .pipe(take(1))
      .subscribe(
        (response: GetCommentsResponse) => {
          this.loadingCommentsBefore = false;
          if (response.comments) {
            const storeRequest: SetCommentsStoreRequest = {
              spotId: this.spot.spotId,
              type: 'before',
              initialLoad: this.initialLoad,
              comments: response.comments,
              totalCommentsBefore: response.totalCommentsBefore
            };
            this.store$.dispatch(
              new CommentStoreActions.SetCommentsRequestAction(storeRequest)
            );
            this.totalCommentsBefore = response.totalCommentsBefore;
          }
        },
        (err: SpotError) => {
          // Error case
          this.loadingCommentsBefore = false;
        }
      );
  }

  invalidLength(): boolean {
    return this.currentLength > COMMENTS_CONSTANTS.MAX_CONTENT_LENGTH;
  }

  onFileChanged(event): void {
    if (event.target.files.length > 0) {
      this.imageFile = event.target.files[0];
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

  showTagTrue(): void {
    const distanceToTop = this.tag.nativeElement.getBoundingClientRect().top;

    if (distanceToTop < 200) {
      this.showTagBottom = true;
    } else {
      this.showTagBottom = false;
    }

    this.showTag = true;
  }

  hideTag(): void {
    this.showTag = false;
    this.showTagBottom = false;
    this.tagName = '';
  }
}
