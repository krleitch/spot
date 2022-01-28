import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Observable, Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { RootStoreState } from '@store';
import { PostsStoreActions, PostsStoreSelectors } from '@store/posts-store';

// Models
import { AddPostRequest } from '@models/posts';
import { Location } from '@models/accounts';
import { SpotError } from '@exceptions/error';

// Assets
import { STRINGS } from '@assets/strings/en';
import { POSTS_CONSTANTS } from '@constants/posts';

@Component({
  selector: 'spot-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  @ViewChild('create') create: ElementRef;

  STRINGS = STRINGS.MAIN.CREATE;
  POSTS_CONSTANTS = POSTS_CONSTANTS;

  // Location
  location$: Observable<Location>;
  location: Location;

  // Content
  currentLength = 0;

  // Images
  imageFile: File;
  imgSrc: string = null;

  // Create
  createSuccess$: Observable<boolean>;
  createLoading = false;
  createError$: Observable<SpotError>;
  createError: string;

  constructor(
    private store$: Store<RootStoreState.State>,
    public domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Success
    this.createSuccess$ = this.store$.pipe(
      select(PostsStoreSelectors.selectCreatePostsSuccess)
    );

    this.createSuccess$
      .pipe(takeUntil(this.onDestroy), skip(1))
      .subscribe((success: boolean) => {
        this.createLoading = false;
        if (success) {
          this.removeFile();
          this.create.nativeElement.innerText = '';
          this.create.nativeElement.innerHTML = '';
          Array.from(this.create.nativeElement.children).forEach(
            (c: HTMLElement) => (c.innerHTML = '')
          );
          this.create.nativeElement.innerHTML = '';
          this.currentLength = 0;
        }
      });

    // Error
    this.createError$ = this.store$.pipe(
      select(PostsStoreSelectors.selectCreatePostsError)
    );

    this.createError$
      .pipe(takeUntil(this.onDestroy), skip(1))
      .subscribe((createError: SpotError) => {
        this.createLoading = false;
        if (createError) {
          if (createError.name === 'InvalidPostProfanity') {
            this.createError = this.STRINGS.ERROR_PROFANITY.replace(
              '%PROFANITY%',
              createError.body.word
            );
          } else {
            this.createError = createError.message;
          }
        }
      });

    // Location
    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectLocation)
    );

    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: Location) => {
        this.location = location;
      });
  }

  ngAfterViewInit(): void {
    this.create.nativeElement.addEventListener('paste', (event: any) => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  onTextInput(event): void {
    // remove <br> if empty
    if (event.target.textContent.length === 0) {
      this.create.nativeElement.innerHTML = '';
    }
    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = Math.max(
      0,
      event.target.textContent.length + event.target.childNodes.length - 1
    );
    // Reset the error when you start typing
    this.createError = '';
  }

  invalidLength(): boolean {
    return this.currentLength > POSTS_CONSTANTS.MAX_CONTENT_LENGTH;
  }

  submit(): void {
    let content = this.create.nativeElement.innerHTML;

    // parse the innerhtml to return a string with newlines instead of innerhtml
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(content, 'text/html');

    const body = parsedHtml.getElementsByTagName('body');
    const bodyChildren = body[0].children;

    let text;
    if (body[0].childNodes.length > 0) {
      text = body[0].childNodes[0].nodeValue || '';

      for (let i = 0; i < bodyChildren.length; i++) {
        if (i === 0) {
          text += '\n';
        }
        text += bodyChildren[i].textContent;
        if (i !== bodyChildren.length - 1) {
          text += '\n';
        }
      }
    } else {
      text = body[0].textContent;
    }

    // trim whitespace at beginning and end
    content = text.trim();

    if (content.split(/\r\n|\r|\n/).length > POSTS_CONSTANTS.MAX_LINE_LENGTH) {
      this.createError = this.STRINGS.ERROR_LINE_LENGTH.replace(
        '%LENGTH%',
        POSTS_CONSTANTS.MAX_LINE_LENGTH.toString()
      );
      return;
    }

    if (content.length === 0 && !this.imageFile) {
      this.createError = this.STRINGS.ERROR_NO_CONTENT;
      return;
    }

    if (content.length < POSTS_CONSTANTS.MIN_CONTENT_LENGTH) {
      this.createError = this.STRINGS.ERROR_MIN_CONTENT.replace(
        '%MIN%',
        POSTS_CONSTANTS.MIN_CONTENT_LENGTH.toString()
      );
      return;
    }

    if (content.length > POSTS_CONSTANTS.MAX_CONTENT_LENGTH) {
      this.createError = this.STRINGS.ERROR_MAX_CONTENT.replace(
        '%MAX%',
        POSTS_CONSTANTS.MAX_CONTENT_LENGTH.toString()
      );
      return;
    }

    // Only allow ascii characters currently, so check anything but ascii
    // So user knows what they need to change
    const regex = /^[^\x00-\x7F]*$/;
    const match = content.match(regex);
    if (match && match[0].length > 0) {
      this.createError = this.STRINGS.ERROR_INVALID_CONTENT + match[0];
      return;
    }

    // Send the request
    if (this.location != null) {
      const post: AddPostRequest = {
        content,
        location: this.location,
        image: this.imageFile
      };
      this.store$.dispatch(new PostsStoreActions.AddRequestAction(post));
      this.createLoading = true;
    } else {
      this.createError = this.STRINGS.ERROR_LOCATION;
      return;
    }
  }

  onFileChanged(event): void {
    this.imageFile = event.target.files[0];
    this.imgSrc = window.URL.createObjectURL(this.imageFile);
    this.createError = '';
  }

  removeFile(): void {
    this.imageFile = null;
    this.imgSrc = null;
    this.createError = '';
  }
}
