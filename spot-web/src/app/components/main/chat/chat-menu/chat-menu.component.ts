import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { v4 as uuidv4 } from 'uuid';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { SocialStoreSelectors } from '@store/social-store';
import { ChatStoreSelectors, ChatStoreActions } from '@store/chat-store';
import { UserStoreSelectors } from '@src/app/root-store/user-store';

// Services
import { ChatService } from '@services/chat.service';
import { ModalService } from '@services/modal.service';

// phoenix
import { Channel as PhoenixChannel } from 'phoenix';

// Models
import { Friend } from '@models/friend';
import {
  ChatType,
  MenuStatus,
  ChatRoom,
  ChatTab,
  AddOpenChatStore,
  RemoveOpenChatStore,
  AddMinimizedChatStore,
  RemoveMinimizedChatStore,
  GetUserChatRoomsRequest
} from '@models/chat';
import { LocationData } from '@models/location';

@Component({
  selector: 'spot-chat-menu',
  templateUrl: './chat-menu.component.html',
  styleUrls: ['./chat-menu.component.scss']
})
export class ChatMenuComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  eMenuStatus = MenuStatus;
  eChatType = ChatType;

  menuStatus = this.eMenuStatus.EXPANDED_SEMI;
  selectedChatOption = this.eChatType.ROOM;

  // Search
  search = '';

  // Friends
  friends$: Observable<Friend[]>;

  // location
  location$: Observable<LocationData>;
  location: LocationData;

  // Tabs
  openChats$: Observable<Array<ChatTab>>;
  chats: Array<ChatTab> = [];
  minimizedChats$: Observable<Array<ChatTab>>;
  minimizedChats: Array<ChatTab> = [];

  // Rooms
  userChatRooms$: Observable<ChatRoom[]>;

  constructor(
    private store$: Store<RootStoreState.State>,
    private chatService: ChatService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    // friends
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    // chat rooms
    this.userChatRooms$ = this.store$.pipe(
      select(ChatStoreSelectors.selectUserChatRooms)
    );
    this.openChats$ = this.store$.pipe(
      select(ChatStoreSelectors.selectOpenChats)
    );
    this.openChats$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((chats: ChatTab[]) => {
        this.chats = chats;
      });
    this.minimizedChats$ = this.store$.pipe(
      select(ChatStoreSelectors.selectMinimizedChats)
    );
    this.minimizedChats$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((chats: ChatTab[]) => {
        this.minimizedChats = chats;
      });

    // location
    this.location$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocation)
    );
    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: LocationData) => {
        this.location = location;
        if (this.location) {
          // Get All Rooms
          const getUserChatRoomsRequest: GetUserChatRoomsRequest = {
            lat: this.location.latitude,
            lng: this.location.longitude
          };
          this.store$.dispatch(
            new ChatStoreActions.GetUserChatRoomsRequestAction(
              getUserChatRoomsRequest
            )
          );
        }
      });

    const localMenuStatus = localStorage.getItem('menuStatus');
    if (localMenuStatus) {
      this.menuStatus = MenuStatus[localMenuStatus];
    }
    const localChatOption = localStorage.getItem('chatOption');
    if (localChatOption) {
      this.selectedChatOption = ChatType[localChatOption];
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  toggleMenu(): void {
    if (this.menuStatus === MenuStatus.HIDDEN) {
      this.menuStatus = MenuStatus.EXPANDED_FULL;
      localStorage.setItem('menuStatus', MenuStatus.EXPANDED_FULL);
    } else if (this.menuStatus === MenuStatus.EXPANDED_SEMI) {
      this.menuStatus = MenuStatus.HIDDEN;
      localStorage.setItem('menuStatus', MenuStatus.HIDDEN);
    } else if (this.menuStatus === MenuStatus.EXPANDED_FULL) {
      this.menuStatus = MenuStatus.EXPANDED_SEMI;
      localStorage.setItem('menuStatus', MenuStatus.EXPANDED_SEMI);
    }
  }

  selectRooms(): void {
    this.selectedChatOption = this.eChatType.ROOM;
    localStorage.setItem('chatOption', ChatType.ROOM);
  }

  selectFriends(): void {
    this.selectedChatOption = this.eChatType.FRIEND;
    localStorage.setItem('chatOption', ChatType.FRIEND);
  }

  // TABS

  // Close the lru if too many tabs
  checkTooManyTabs() {
    if (this.chats.length >= 3) {
      const firstTab = this.chats[0];
      this.minimizeTab(firstTab.tabId);
    }
  }

  // Check the inner chat id or friend id, as the tabId will be diff
  tabExists(id: string, type: ChatType): boolean {
    // If already open do nothing // TODO: select it
    const tab = this.chats.filter((t) =>
      type === ChatType.ROOM
        ? (t.data as ChatRoom).id === id
        : (t.data as Friend).friendId === id
    );
    if (tab.length > 0) {
      return true;
    }
    // Check the minimized tabs
    const mtab = this.minimizedChats.filter((t) =>
      type === ChatType.ROOM
        ? (t.data as ChatRoom).id === id
        : (t.data as Friend).friendId === id
    );
    if (mtab.length > 0) {
      this.checkTooManyTabs();
      this.openMinimizedTab(mtab[0].tabId);
      return true;
    }
    return false;
  }

  createFriendTab(friendData: {friend: Friend, channel: PhoenixChannel}) {
    console.log(friendData)
    // check if the tab exists already
    if (this.tabExists(friendData.friend.friendId, ChatType.FRIEND)) {
      return;
    }
    this.checkTooManyTabs();
    const newFriend: Friend = {
      ...friendData.friend
    };
    const request: AddOpenChatStore = {
      tab: {
        tabId: uuidv4(),
        type: ChatType.FRIEND,
        data: newFriend
      }
    };
    this.store$.dispatch(new ChatStoreActions.AddOpenChatStoreAction(request));
  }

  createRoomTab(room: ChatRoom) {
    // check if the tab exists already
    if (this.tabExists(room.id, ChatType.ROOM)) {
      return;
    }
    this.checkTooManyTabs();
    const newChat: ChatRoom = {
      ...room
    };
    const request: AddOpenChatStore = {
      tab: {
        tabId: uuidv4(),
        type: ChatType.ROOM,
        data: newChat
      }
    };
    this.store$.dispatch(new ChatStoreActions.AddOpenChatStoreAction(request));
  }

  openMinimizedTab(tabId: string) {
    // get the tab
    const tab = this.minimizedChats.filter(
      (elem: ChatTab) => elem.tabId === tabId
    );
    if (!tab) {
      return;
    }
    // add to open
    const addRequest: AddOpenChatStore = {
      tab: tab[0]
    };
    this.store$.dispatch(
      new ChatStoreActions.AddOpenChatStoreAction(addRequest)
    );
    // remove from minimized
    const removeRequest: RemoveMinimizedChatStore = {
      tabId: tabId
    };
    this.store$.dispatch(
      new ChatStoreActions.RemoveMinimizedChatStoreAction(removeRequest)
    );
  }

  minimizeTab = (id: string) => {
    // get the tab
    const tab = this.chats.filter((elem: ChatTab) => elem.tabId === id);
    if (!tab) {
      return;
    }
    // add to minimized
    const addRequest: AddMinimizedChatStore = {
      tab: tab[0]
    };
    this.store$.dispatch(
      new ChatStoreActions.AddMinimizedChatStoreAction(addRequest)
    );
    // Remove from open
    const removeRequest: RemoveOpenChatStore = {
      tabId: id
    };
    this.store$.dispatch(
      new ChatStoreActions.RemoveOpenChatStoreAction(removeRequest)
    );
  };

  getMinimizedName(name: string) {
    if (name) {
      return name.substring(0, 1).toUpperCase() + name.substring(1, 2);
    }
  }

  discoverRooms() {
    this.modalService
      .open('global', 'chatDiscover', {}, { width: 600, height: 'auto' })
      .pipe(take(1))
      .subscribe((_result) => {
        // Open the room, if a room was created
      });
  }

  createRoom() {
    this.modalService
      .open('global', 'chatCreate')
      .pipe(take(1))
      .subscribe((_result) => {
        // Open the room, if a room was created
      });
  }
}
