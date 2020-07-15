import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

import { STRINGS } from '@assets/strings/en';
import { AddPostRequest } from '@models/posts';
import { RootStoreState } from '@store';
import { PostsStoreActions, PostsStoreSelectors } from '@store/posts-store';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { Location } from '@models/accounts';
import { SpotError } from '@exceptions/error';
import { POSTS_CONSTANTS } from '@constants/posts';

@Component({
  selector: 'spot-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit, OnDestroy {

  private readonly onDestroy = new Subject<void>();

  @ViewChild('create') create: ElementRef;

  STRINGS = STRINGS.MAIN.CREATE;
  POSTS_CONSTANTS = POSTS_CONSTANTS;

  location$: Observable<Location>;
  location: Location;

  postInnerHtml = '';
  currentLength = 0;

  imageFile: File;
  imgSrc: string = null;

  createSuccess$: Observable<boolean>;
  createError$: Observable<SpotError>;
  createError: string;

  constructor(private store$: Store<RootStoreState.State>, public domSanitizer: DomSanitizer) { }

  ngOnInit() {

    // Success Event
    this.createSuccess$ = this.store$.pipe(
      select(PostsStoreSelectors.selectCreatePostsSuccess)
    );

    this.createSuccess$.pipe(takeUntil(this.onDestroy)).subscribe( (success: boolean) => {
      if ( success ) {
        this.removeFile();
        this.create.nativeElement.innerText = '';
        this.create.nativeElement.innerHtml = '';
        Array.from(this.create.nativeElement.children).forEach((c: HTMLElement) => c.innerHTML = '');
        this.postInnerHtml = '';
        this.currentLength = this.postInnerHtml.length;
      }
    });

    // Errors
    this.createError$ = this.store$.pipe(
      select(PostsStoreSelectors.selectCreatePostsError)
    );

    this.createError$.pipe(takeUntil(this.onDestroy)).subscribe( (createError: SpotError) => {
      if ( createError ) {
        this.createError = createError.message;
      }
    });

    // Location
    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLocation)
    );

    this.location$.pipe(takeUntil(this.onDestroy)).subscribe( (location: Location) => {
      this.location = location;
    });

  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  onTextInput(event) {
    this.postInnerHtml = event.target.innerHTML;
    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = event.target.textContent.length + event.target.childNodes.length - 1;
    this.createError = null;
  }

  invalidLength(): boolean {
    return this.currentLength > POSTS_CONSTANTS.MAX_CONTENT_LENGTH;
  }

  submit() {

    let content = this.postInnerHtml;

    // parse the innerhtml to return a string with newlines instead of innerhtml
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(content, 'text/html');

    const body = parsedHtml.getElementsByTagName('body');
    const bodyChildren = body[0].children;

    let text;
    if ( body[0].childNodes.length > 0 ) {
      text = body[0].childNodes[0].nodeValue || '';

      for (let i = 0; i < bodyChildren.length; i++) {
        if ( i === 0 ) {
          text += '\n';
        }
        text +=  (bodyChildren[i].textContent);
        if ( i !== bodyChildren.length - 1 ) {
          text += '\n';
        }
      }

    } else {
      text = body[0].textContent;
    }

    // trim whitespace at beginning and end
    content = text.trim();

    if ( content.split(/\r\n|\r|\n/).length > POSTS_CONSTANTS.MAX_LINE_LENGTH ) {
      this.createError = 'Your spot must be less than ' + POSTS_CONSTANTS.MAX_LINE_LENGTH + ' lines';
      return;
    }

    if ( content.length === 0 && !this.imageFile ) {
      this.createError = 'Your spot must have text or an image';
      return;
    }

    if ( content.length < POSTS_CONSTANTS.MIN_CONTENT_LENGTH ) {
      this.createError = 'Spot must be greater than ' + POSTS_CONSTANTS.MIN_CONTENT_LENGTH + ' characters';
      return;
    }

    if ( content.length > POSTS_CONSTANTS.MAX_CONTENT_LENGTH ) {
      this.createError = 'Spot must be less than ' + POSTS_CONSTANTS.MAX_CONTENT_LENGTH + ' characters';
      return;
    }

    // Only allow ascii characters currently, so check anything but ascii
    // So user knows what they need to change
    const regex = /^[^\x00-\x7F]*$/;
    const match = content.match(regex);
    if ( match && match[0].length > 0 ) {
      this.createError = 'Invalid spot content ' + match[0];
      return;
    }

    // Send the request
    if ( this.location != null) {

      const post: AddPostRequest = {
        content,
        location: this.location,
        image: this.imageFile
      };

      this.store$.dispatch(
        new PostsStoreActions.AddRequestAction(post)
      );

    } else {

      this.createError = 'Location needed to create spot';
      return;

    }

  }

  onFileChanged(event) {
    this.imageFile = event.target.files[0];
    this.imgSrc = window.URL.createObjectURL(this.imageFile);
    this.createError = '';
  }

  removeFile() {
    this.imageFile = null;
    this.imgSrc = null;
    this.createError = '';
  }

}
