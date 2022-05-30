import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

// rxjs
import { Observable, from } from 'rxjs';

// Store
import { RootStoreState } from '@store';
import { Store, select } from '@ngrx/store';
import {
  SocialStoreFriendActions,
  SocialStoreSelectors
} from '@store/social-store';

// Assets
import { Friend, GetFriendsRequest } from '@models/friend';

@Component({
  selector: 'spot-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss']
})
export class TagComponent implements OnInit {
  @Input() postLink;
  @Input() name;
  @Output() tag = new EventEmitter<string>();

  constructor(private store$: Store<RootStoreState.State>) {}

  friends$: Observable<Friend[]>;
  friends: Friend[] = [];

  link: string;

  ngOnInit(): void {
    // setup observables
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    this.friends$.subscribe((friends) => {
      this.friends = friends;
    });

    this.link = window.location.origin + '/posts/' + this.postLink;
  }

  sendTag(username: string): void {
    this.tag.emit(username);
  }

  onEnter(): boolean {
    const filteredFriendsList = this.friends.filter((friend) => {
      return (
        friend.username.toUpperCase().indexOf(this.name.toUpperCase()) !== -1
      );
    });
    if (filteredFriendsList.length > 0) {
      this.tag.emit(filteredFriendsList[0].username);
      return false;
    }
  }
}
