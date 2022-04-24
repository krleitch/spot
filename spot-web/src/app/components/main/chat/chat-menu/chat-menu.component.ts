import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { SocialStoreSelectors } from '@store/social-store';
import { ChatStoreSelectors, ChatStoreActions } from '@store/chat-store';
import { UserStoreSelectors } from '@src/app/root-store/user-store';

// Services
import { ChatService } from '@services/chat.service';
import { ModalService } from '@services/modal.service';

// Models
import { Friend } from '@models/friend';
import {
  ChatType,
  ChatRoom,
  AddOpenChatStore,
  RemoveOpenChatStore,
  AddMinimizedChatStore,
  RemoveMinimizedChatStore,
  GetUserChatRoomsRequest
} from '@models/chat';
import { LocationData } from '@models/location';

enum MenuStatus {
  HIDDEN = 'HIDDEN',
  EXPANDED_SEMI = 'EXPANDED_SEMI',
  EXPANDED_FULL = 'EXPANDED_FULL'
}

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
  openChats$: Observable<ChatRoom[]>;
  chats: ChatRoom[] = [];
  minimizedChats$: Observable<ChatRoom[]>;
  minimizedChats: ChatRoom[] = [];
  userChatRooms$: Observable<ChatRoom[]>;

  constructor(
    private store$: Store<RootStoreState.State>,
    private chatService: ChatService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );
    this.userChatRooms$ = this.store$.pipe(
      select(ChatStoreSelectors.selectUserChatRooms)
    );
    this.openChats$ = this.store$.pipe(
      select(ChatStoreSelectors.selectOpenChats)
    );
    this.openChats$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((chats: ChatRoom[]) => {
        this.chats = chats;
      });
    this.minimizedChats$ = this.store$.pipe(
      select(ChatStoreSelectors.selectMinimizedChats)
    );
    this.minimizedChats$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((chats: ChatRoom[]) => {
        this.minimizedChats = chats;
      });
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
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  toggleMenu(): void {
    if (this.menuStatus === MenuStatus.HIDDEN) {
      this.menuStatus = MenuStatus.EXPANDED_FULL;
    } else if (this.menuStatus === MenuStatus.EXPANDED_SEMI) {
      this.menuStatus = MenuStatus.HIDDEN;
    } else if (this.menuStatus === MenuStatus.EXPANDED_FULL) {
      this.menuStatus = MenuStatus.EXPANDED_SEMI;
    }
  }

  selectRooms(): void {
    this.selectedChatOption = this.eChatType.ROOM;
  }

  selectFriends(): void {
    this.selectedChatOption = this.eChatType.FRIEND;
  }

  // TABS

  // Close the lru if too many tabs
  checkTooManyTabs() {
    if (this.chats.length >= 3) {
      const firstTab = this.chats[0];
      this.minimizeTab(firstTab.id);
    }
  }

  // Check the inner chat id, as the tabId will be diff
  tabExists(chatId: string): boolean {
    // If already open do nothing // TODO: select it
    const tab = this.chats.filter((t) => t.id === chatId);
    if (tab.length > 0) {
      return true;
    }
    // Check the minimized tabs
    const mtab = this.minimizedChats.filter((t) => t.id === chatId);
    if (mtab.length > 0) {
      this.checkTooManyTabs();
      this.openMinimizedTab(mtab[0].id);
      return true;
    }
    return false;
  }

  createFriendTab(friend: Friend) {
    // check if the tab exists already
    if (this.tabExists(null)) {
      return;
    }
    this.checkTooManyTabs();
    // const newChat: ChatRoom = {
    // tabId: uuidv4(),
    // name: friend.username,
    // imageSrc: friend.profilePictureSrc,
    // type: ChatType.FRIEND,
    // chat: null
    // };
    // const request: AddOpenChatStore = {
    // tab: newTab
    // };
    // this.store$.dispatch(new ChatStoreActions.AddOpenChatStoreAction(request));
  }

  createRoomTab(room: ChatRoom) {
    // check if the tab exists already
    if (this.tabExists(room.id)) {
      return;
    }
    this.checkTooManyTabs();
    const newChat: ChatRoom = {
      ...room
    };
    const request: AddOpenChatStore = {
      chat: newChat
    };
    this.store$.dispatch(new ChatStoreActions.AddOpenChatStoreAction(request));
  }

  openMinimizedTab(id: string) {
    // get the tab
    const tab = this.minimizedChats.filter((elem: ChatRoom) => elem.id === id);
    if (!tab) {
      return;
    }
    // add to open
    const addRequest: AddOpenChatStore = {
      chat: tab[0]
    };
    this.store$.dispatch(
      new ChatStoreActions.AddOpenChatStoreAction(addRequest)
    );
    // remove from minimized
    const removeRequest: RemoveMinimizedChatStore = {
      chatId: id
    };
    this.store$.dispatch(
      new ChatStoreActions.RemoveMinimizedChatStoreAction(removeRequest)
    );
  }

  minimizeTab = (id: string) => {
    // get the tab
    const tab = this.chats.filter((elem: ChatRoom) => elem.id === id);
    if (!tab) {
      return;
    }
    // add to minimized
    const addRequest: AddMinimizedChatStore = {
      chat: tab[0]
    };
    this.store$.dispatch(
      new ChatStoreActions.AddMinimizedChatStoreAction(addRequest)
    );
    // Remove from open
    const removeRequest: RemoveOpenChatStore = {
      chatId: id
    };
    this.store$.dispatch(
      new ChatStoreActions.RemoveOpenChatStoreAction(removeRequest)
    );
  };

  getMinimizedName(name: string) {
    if (name) {
      return name.substring(0, 1).toUpperCase();
    }
  }

  discoverRooms() {
    this.modalService
      .open('global', 'chatDiscover')
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
