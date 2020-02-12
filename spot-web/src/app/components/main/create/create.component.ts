import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

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

  constructor(private store$: Store<RootStoreState.State>) { }

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

}
