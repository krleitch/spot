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
import { Tag } from '@models/comment';
import { Friend } from '@models/friend';
import { SpotError } from '@exceptions/error';
import { User } from '@models/user';
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
import { COMMENTS_CONSTANTS } from '@constants/comments';

@Component({
  selector: 'spot-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.scss']
})
export class ReplyComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  @Input() detailed: boolean;
  @Input() reply: Comment;
  @Input() comment: Comment;
  @Input() spot: Spot;

  @ViewChild('options') options;
  @ViewChild('text') text;
  @ViewChild('reply2') reply2;

  @ViewChild('tag') tag: ElementRef;
  @ViewChild('tagelem') tagelem: TagComponent;
  showTag = false;
  tagName = '';
  tagElement;
  tagCaretPosition;
  tagged$: Observable<boolean>;
  tagged: boolean; // Was the user tagged in the comment chain

  location$: Observable<LocationData>;
  location: LocationData;
  friends$: Observable<Friend[]>;
  friendsList: Friend[] = [];

  STRINGS;
  eCommentRatingType = CommentRatingType;
  COMMENTS_CONSTANTS = COMMENTS_CONSTANTS;

  isAuthenticated$: Observable<boolean>;
  isVerified$: Observable<boolean>;
  userMetadata$: Observable<UserMetadata>;
  user$: Observable<User>;
  user: User;

  // For large replies
  expanded = false;
  MAX_SHOW_REPLY_LENGTH = 100;
  isExpandable = false;

  reply2Text: string;
  addReply2Error: string;
  addReply2Loading = false;

  FILENAME_MAX_SIZE = 20;
  imageFile: File;
  imgSrc: string = null;
  imageBlurred: boolean; // if content flagged nsfw

  // displaying used characters for add reply
  MAX_REPLY_LENGTH = 300;
  currentLength = 0;

  timeMessage: string;
  showAddReply = false;
  optionsEnabled = false;

  currentOffset = 0;

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
    this.TranslateService.get('MAIN.REPLY').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    this.getTime(this.reply.createdAt);
    this.imageBlurred = this.reply.imageNsfw;

    this.isAuthenticated$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsAuthenticated)
    );

    this.isVerified$ = this.store$.pipe(
      select(UserStoreSelectors.selectIsVerified)
    );

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

    if (
      this.reply.content.split(/\r\n|\r|\n/).length >
        COMMENTS_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH ||
      this.reply.content.length > COMMENTS_CONSTANTS.MAX_TRUNCATE_LENGTH
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

  offClickHandler(event: MouseEvent): void {
    if (this.options && !this.options.nativeElement.contains(event.target)) {
      this.setOptions(false);
    }

    if (this.tag && !this.tag.nativeElement.contains(event.target)) {
      this.showTag = false;
    }

    if (this.reply2 && this.reply2.nativeElement.contains(event.target)) {
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
    if (this.reply.tag.tags.length > 0) {
      this.reply.tag.tags.forEach((tag: Tag) => {
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
      return this.reply.content;
    }

    const textArrays = this.reply.content.split(/\r\n|\r|\n/);
    let truncatedContent = '';

    for (
      let i = 0;
      i < textArrays.length && i < COMMENTS_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH;
      i++
    ) {
      if (
        truncatedContent.length + textArrays[i].length >
        COMMENTS_CONSTANTS.MAX_TRUNCATE_LENGTH
      ) {
        truncatedContent = textArrays[i].substring(
          0,
          COMMENTS_CONSTANTS.MAX_TRUNCATE_LENGTH - truncatedContent.length
        );
        break;
      } else {
        truncatedContent += textArrays[i];
        // Dont add newline for last line or last line before line length reached
        if (
          i !== textArrays.length - 1 &&
          i !== COMMENTS_CONSTANTS.MAX_LINE_TRUNCATE_LENGTH - 1
        ) {
          truncatedContent += '\n';
        }
      }
    }

    return truncatedContent;
  }

  onTextInput(event): void {
    if (event.target.textContent.length === 0) {
      this.reply2.nativeElement.innerHTML = '';
    }
    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = Math.max(
      event.target.textContent.length + event.target.childNodes.length - 1,
      0
    );
    this.addReply2Error = null;
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

  setOptions(value): void {
    this.optionsEnabled = value;
  }

  getTime(date): void {
    const curTime = new Date();
    const spotTime = new Date(date);
    const timeDiff = curTime.getTime() - spotTime.getTime();
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

  setExpanded(value: boolean): void {
    this.expanded = value;
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

  setShowAddReply(val: boolean): void {
    this.showAddReply = val;
    setTimeout(() => {
      if (this.showAddReply === true && this.reply2) {
        this.reply2.nativeElement.focus({
          preventScroll: true
        });
      }
    }, 100);
  }

  addReply(): void {
    let content = this.reply2.nativeElement.innerHTML;

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
      content.split(/\r\n|\r|\n/).length > COMMENTS_CONSTANTS.MAX_LINE_LENGTH
    ) {
      this.addReply2Error = this.STRINGS.ERROR_LINE_LENGTH.replace(
        '%LENGTH%',
        COMMENTS_CONSTANTS.MAX_LINE_LENGTH.toString()
      );
      return;
    }

    if (content.length === 0 && !this.imageFile && tags.length === 0) {
      this.addReply2Error = this.STRINGS.ERROR_NO_CONTENT;
      return;
    }

    if (content.length < COMMENTS_CONSTANTS.MIN_CONTENT_LENGTH) {
      this.addReply2Error = this.STRINGS.ERROR_MIN_CONTENT.replace(
        '%MIN%',
        COMMENTS_CONSTANTS.MIN_CONTENT_LENGTH.toString()
      );
      return;
    }

    if (content.length > COMMENTS_CONSTANTS.MAX_CONTENT_LENGTH) {
      this.addReply2Error = this.STRINGS.ERROR_MAX_CONTENT.replace(
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
      commentParentId: this.reply.commentId,
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

  getProfilePictureClass(index): string {
    return this.commentService.getProfilePictureClass(index);
  }

  invalidLength(): boolean {
    return this.currentLength > this.MAX_REPLY_LENGTH;
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
      const modalData: ModalImageData = { imageSrc: this.reply.imageSrc };
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
    postLink: string,
    replyId: string,
    replyLink: string
  ): void {
    if (!this.authenticationService.isAuthenticated()) {
      this.modalService.open('global', 'auth');
      return;
    }

    this.modalService.open('global', 'share', {
      spotId: spotId,
      spotLink: postLink,
      commentId: replyId,
      commentLink: replyLink
    });
  }
}
