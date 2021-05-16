import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

// rxjs
import { Observable, from } from 'rxjs';

// Store
import { RootStoreState } from '@store';
import { Store, select } from '@ngrx/store';
import { SocialStoreFriendsActions, SocialStoreSelectors } from '@store/social-store';

// Assets
import { STRINGS } from '@assets/strings/en';
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

  ngOnInit(): void {

    // setup observables
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    this.friends$.subscribe ( friends => {
      this.friendsList = friends;
      this.filteredFriendsList = friends;
      this.findFriend();
    });

    this.link = window.location.origin + '/posts/' + this.postLink;

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.findFriend();
  }

  findFriend(): void {

    if ( this.name ) {
      this.filteredFriendsList = this.friendsList.filter( friend => {
        return friend.username.toUpperCase().indexOf(this.name.toUpperCase()) !== -1;
      });
    } else {
      this.filteredFriendsList = this.friendsList;
    }

  }

  sendTag(username: string): void {
    this.tag.emit(username);
  }

  onEnter(): boolean {

    if ( this.filteredFriendsList.length > 0 ) {
      this.tag.emit(this.filteredFriendsList[0].username);
      return false;
    }

  }

}
