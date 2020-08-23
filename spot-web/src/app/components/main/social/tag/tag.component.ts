import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, from } from 'rxjs';

import { STRINGS } from '@assets/strings/en';
import { RootStoreState } from '@store';
import { SocialStoreFriendsActions, SocialStoreSelectors } from '@store/social-store';
import { Friend, GetFriendsRequest } from '@models/friends';
import { Tag } from '@models/notifications';

@Component({
  selector: 'spot-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss']
})
export class TagComponent implements OnInit, OnChanges {

  @Input() postLink;
  @Input() name;
  @Output() tag = new EventEmitter<string>();

  constructor(private store$: Store<RootStoreState.State>) { }

  STRINGS = STRINGS.MAIN.TAG;

  friends$: Observable<Friend[]>;
  friendsList: Friend[] = [];
  filteredFriendsList: Friend[] = [];

  link: string;

  ngOnInit() {

    // setup observables
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectMyFeatureFriends)
    );

    this.friends$.subscribe ( friends => {
      this.friendsList = friends;
      this.filteredFriendsList = friends;
      this.findFriend();
    });

    this.link = window.location.origin + '/posts/' + this.postLink;

  }

  ngOnChanges(changes: SimpleChanges) {
    this.findFriend();
  }

  findFriend() {

    if ( this.name ) {
      this.filteredFriendsList = this.friendsList.filter( friend => {
        return friend.username.toUpperCase().indexOf(this.name.toUpperCase()) !== -1;
      });
    } else {
      this.filteredFriendsList = this.friendsList;
    }

  }

  sendTag(username: string) {
    this.tag.emit(username);
  }

  onEnter() {

    if ( this.filteredFriendsList.length > 0 ) {
      this.tag.emit(this.filteredFriendsList[0].username);
    }

  }

}
