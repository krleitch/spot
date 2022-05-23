import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

// services
import { ChatService } from '@services/chat.service';

// Components
import { ChatRoomComponent } from '@src/app/components/main/chat/chat-room/chat-room.component';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { SocialStoreSelectors } from '@store/social-store';
import { UserStoreSelectors } from '@store/user-store';
import { ChatStoreSelectors, ChatStoreActions } from '@store/chat-store';

// models
import { RemoveOpenChatStore, AddMinimizedChatStore } from '@models/chat';
import {
  ChatType,
  ChatRoom,
  LeaveChatRoomRequest,
  LeaveChatRoomResponse,
  RemoveUserChatRoomStore
} from '@models/chat';
import { UserMetadata, UnitSystem } from '@models/userMetadata';

@Component({
  selector: 'spot-chat-tab',
  templateUrl: './chat-tab.component.html',
  styleUrls: ['./chat-tab.component.scss']
})
export class ChatTabComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  @Input() tab: ChatRoom;
  @ViewChild(ChatRoomComponent) room: ChatRoomComponent;
  @Input() minimize: (_id: string) => void;

  // state
  @ViewChild('settings') settings;
  showDropdown = false;

  // User Metadata
  userMetadata$: Observable<UserMetadata>;
  userMetadata: UserMetadata;

  constructor(
    private store$: Store<RootStoreState.State>,
    private chatService: ChatService
  ) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit(): void {
    // metadata
    this.userMetadata$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserMetadata)
    );
    this.userMetadata$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((userMetadata: UserMetadata) => {
        this.userMetadata = userMetadata;
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  offClickHandler(event: MouseEvent): void {
    // Hide the dropdown if you click outside
    if (this.settings && !this.settings.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  getMinimizedName(name: string) {
    if (name) {
      return name.substring(0, 1).toUpperCase();
    }
  }

  getDistance(distance: number): string {
    let unit: UnitSystem;
    if (this.userMetadata) {
      unit = this.userMetadata.unitSystem;
    } else {
      unit = UnitSystem.IMPERIAL;
    }

    let distanceString = '';

    if (unit === UnitSystem.METRIC) {
      distanceString += (distance * 1.60934).toFixed(1) + ' km';
    } else {
      distanceString += distance.toFixed(1) + ' m';
    }
    return distanceString;
  }

  minimizeTab() {
    // Call the inner chat close
    // currently minimized tabs are left
    this.room.leaveRoom();

    // add to minimized
    const addRequest: AddMinimizedChatStore = {
      chat: this.tab
    };
    this.store$.dispatch(
      new ChatStoreActions.AddMinimizedChatStoreAction(addRequest)
    );
    // Remove from open
    const removeRequest: RemoveOpenChatStore = {
      chatId: this.tab.id
    };
    this.store$.dispatch(
      new ChatStoreActions.RemoveOpenChatStoreAction(removeRequest)
    );
  }

  closeTab = () => {
    // Call the inner chat close
    this.room.leaveRoom();

    const request: RemoveOpenChatStore = {
      chatId: this.tab.id
    };
    this.store$.dispatch(
      new ChatStoreActions.RemoveOpenChatStoreAction(request)
    );
  };

  leaveChatRoom(): void {
    const leaveChatRoom: LeaveChatRoomRequest = {
      chatRoomId: this.tab.id
    };
    this.chatService
      .leaveChatRoom(leaveChatRoom)
      .pipe(take(1))
      .subscribe((response: LeaveChatRoomResponse) => {
        this.room.leaveRoom();
        const removeUserChatRoomStore: RemoveUserChatRoomStore = {
          chatId: response.chatRoom.id
        };
        this.store$.dispatch(
          new ChatStoreActions.RemoveUserChatRoomStoreAction(
            removeUserChatRoomStore
          )
        );
      });
  }
}
