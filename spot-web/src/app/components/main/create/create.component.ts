import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { STRINGS } from '@assets/strings/en';
import { AddPostRequest } from '@models/posts';
import { RootStoreState } from '@store';
import { PostsStoreActions } from '@store/posts-store';

@Component({
  selector: 'spot-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  STRINGS = STRINGS.MAIN.CREATE;

  constructor(private store$: Store<RootStoreState.State>) { }

  ngOnInit() {
  }

  submit() {
    const contenteditable = document.querySelector('[contenteditable]');
    const content = contenteditable.textContent;

    const post: AddPostRequest = {
      content: content,
    };

    this.store$.dispatch(
      new PostsStoreActions.AddRequestAction(post)
    );
  }

}
