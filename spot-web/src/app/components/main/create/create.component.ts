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

  FILENAME_MAX_SIZE = 25;
  imageFile: File;
  imgSrc: string = null;

  createError$: Observable<SpotError>; // Error from server
  createError = ''; // Error from client

  constructor(private store$: Store<RootStoreState.State>, public domSanitizer: DomSanitizer) { }

  ngOnInit() {

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
    this.postText = event.target.textContent || '';
    this.currentLength = this.postText.length;
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

    if ( this.myLocation != null) {
      const post: AddPostRequest = {
        content,
        location: this.myLocation,
        image: this.imageFile
      };

      this.store$.dispatch(
        new PostsStoreActions.AddRequestAction(post)
      );

      // TODO FIX THIS
      // this.postText = '';
      // this.imageFile = null;

    }
  }

  onFileChanged(event) {
    this.imageFile = event.target.files[0];
    this.imgSrc = window.URL.createObjectURL(this.imageFile);
  }

  removeFile() {
    this.imageFile = null;
    this.imgSrc = null;
  }

  getDisplayFilename(name: string) {
    if (name.length > this.FILENAME_MAX_SIZE) {
      return name.substr(0, this.FILENAME_MAX_SIZE) + '...';
    } else {
      return name;
    }
  }

  // TODO for making focus better
  // setFocus() {
  //   document.getElementById('content').focus();
  // }

  invalidLength(): boolean {
    return this.currentLength > POSTS_CONSTANTS.MAX_CONTENT_LENGTH;
  }

}
