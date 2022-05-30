import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

// rxjs
import { Observable } from 'rxjs';

// Store
import { RootStoreState } from '@store';
import { Store, select } from '@ngrx/store';
import { SocialStoreSelectors } from '@store/social-store';

// Assets
import { Friend } from '@models/friend';

@Component({
  selector: 'spot-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss']
})
export class TagComponent implements OnInit {
  @Input() username: string;
  @Output() tag = new EventEmitter<string>();

  constructor(private store$: Store<RootStoreState.State>) {}

  friends$: Observable<Friend[]>;
  friends: Friend[] = [];

  ngOnInit(): void {
    // friends
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    this.friends$.subscribe((friends) => {
      this.friends = friends;
    });
  }

  sendTag(username: string): void {
    this.tag.emit(username);
  }

  // Called from the parent to get the first name
  onEnter(): boolean {
    const filteredFriendsList = this.friends.filter((friend) => {
      return (
        friend.username.toUpperCase().indexOf(this.username.toUpperCase()) !==
        -1
      );
    });
    if (filteredFriendsList.length > 0) {
      this.tag.emit(filteredFriendsList[0].username);
      return false;
    }
  }

  // Show if the user does not have a profile picture
  getDisplayName(name: string): string {
    if (name.length) {
      return name[0].toUpperCase();
    } else {
      return '';
    }
  }
}
