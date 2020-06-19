import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

import { STRINGS } from '@assets/strings/en';
import { AddPostRequest } from '@models/posts';
import { RootStoreState } from '@store';
import { PostsStoreActions, PostsStoreSelectors } from '@store/posts-store';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { Location } from '@models/accounts';
import { SpotError } from '@exceptions/error';
import { POSTS_CONSTANTS } from '@constants/posts';
import { PostsService } from '@src/app/services/posts.service';

@Component({
  selector: 'spot-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  STRINGS = STRINGS.MAIN.CREATE;
  POSTS_CONSTANTS = POSTS_CONSTANTS;

  location$: Observable<Location>;
  myLocation: Location;

  postText = '';
  // displaying used characters for create a post
  currentLength = 0;

  imageFile: File;
  imgSrc: string = null;

  createSuccess$: Observable<boolean>;
  createError$: Observable<SpotError>; // Error from server
  createError = ''; // Error from client

  constructor(private store$: Store<RootStoreState.State>, public domSanitizer: DomSanitizer) { }

  ngOnInit() {

    this.createSuccess$ = this.store$.pipe(
      select(PostsStoreSelectors.selectCreatePostsSuccess)
    );

    this.createSuccess$.subscribe( (success: boolean) => {
      console.log('CALLED', success);
      if ( success ) {
        this.removeFile();
        this.postText = '';
        this.currentLength = this.postText.length;
      }
    });

    this.createError$ = this.store$.pipe(
      select(PostsStoreSelectors.selectCreatePostsError)
    );

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLocation)
    );

    this.location$.subscribe( (location: Location) => {
      this.myLocation = location;
    });

  }

  onTextInput(event) {
    console.log(event.keyCode);
    this.postText = event.target.textContent || '';
    this.currentLength = this.postText.length;
    this.createError = '';
  }

  submit() {

    const content = this.postText;

    if ( content.length === 0 && !this.imageFile ) {
      this.createError = 'Your post must have text or an image';
      return;
    }

    if ( content.length < POSTS_CONSTANTS.MIN_CONTENT_LENGTH ) {
      this.createError = 'Post must be greater than ' + POSTS_CONSTANTS.MIN_CONTENT_LENGTH + ' characters';
      return;
    }

    if ( content.length > POSTS_CONSTANTS.MAX_CONTENT_LENGTH ) {
      this.createError = 'Post must be less than ' + POSTS_CONSTANTS.MAX_CONTENT_LENGTH + ' characters';
      return;
    }

    // Only allow ascii characters currently, so check anything but ascii
    // So user knows what they need to change
    const regex = /^[^\x00-\x7F]*$/;
    const match = content.match(regex);
    if ( match && match[0].length > 0 ) {
      this.createError = 'Invalid post content ' + match[0];
      return;
    }

    // Send the request

    if ( this.myLocation != null) {
      const post: AddPostRequest = {
        content,
        location: this.myLocation,
        image: this.imageFile
      };

      this.store$.dispatch(
        new PostsStoreActions.AddRequestAction(post)
      );

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

  invalidLength(): boolean {
    return this.currentLength > POSTS_CONSTANTS.MAX_CONTENT_LENGTH;
  }

}
