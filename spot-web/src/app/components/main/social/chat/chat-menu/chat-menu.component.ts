import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { SocialStoreSelectors } from '@store/social-store';

// Models
import { Friend } from '@models/friends';

@Component({
  selector: 'spot-chat-menu',
  templateUrl: './chat-menu.component.html',
  styleUrls: ['./chat-menu.component.scss']
})
export class ChatMenuComponent implements OnInit {
  chatOptions = {
    FRIENDS: 'FRIENDS',
    ROOMS: 'ROOMS'
  };

  chatExpanded = true;
  selectedChatOption = this.chatOptions.FRIENDS;

  // Friends
  friends$: Observable<Friend[]>;

  constructor(private store$: Store<RootStoreState.State>) {}

  ngOnInit(): void {
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );
  }

  toggleMenu() {
    this.chatExpanded = !this.chatExpanded;
  }

  selectRooms() {
    this.selectedChatOption = this.chatOptions.ROOMS;
  }

  selectFriends() {
    this.selectedChatOption = this.chatOptions.FRIENDS;
  }
}
