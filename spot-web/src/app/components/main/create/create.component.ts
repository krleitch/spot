import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

import { STRINGS } from '@assets/strings/en';
import { AddPostRequest } from '@models/posts';
import { RootStoreState } from '@store';
import { PostsStoreActions } from '@store/posts-store';
import { AccountsStoreSelectors } from '@store/accounts-store';
import { Location } from '@models/accounts';

@Component({
  selector: 'spot-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  STRINGS = STRINGS.MAIN.CREATE;

  location$: Observable<Location>;
  myLocation: Location;

  FILENAME_MAX_SIZE = 25;
  imageFile: File;
  imgSrc: string = null;

  constructor(private store$: Store<RootStoreState.State>, public domSanitizer: DomSanitizer) { }

  ngOnInit() {

    this.location$ = this.store$.pipe(
      select(AccountsStoreSelectors.selectAccountsLocation)
    );

    this.location$.subscribe( (location: Location) => {
      this.myLocation = location;
    });

  }

  submit() {
    const contenteditable = document.querySelector('[contenteditable]');
    const content = contenteditable.textContent;

    // TODO
    // checks on content, make sure location isnt null

    const post: AddPostRequest = {
      content,
      location: this.myLocation
    };

    this.store$.dispatch(
      new PostsStoreActions.AddRequestAction(post)
    );
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

}
