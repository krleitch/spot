import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { take, takeUntil } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { SocialStoreSelectors } from '@store/social-store';
import { ChatStoreSelectors, ChatStoreActions } from '@store/chat-store';

// Services
import { ChatService } from '@services/chat.service';
import { ModalService } from '@services/modal.service';

// Models
import { Friend } from '@models/friend';
import {
  ChatType,
  ChatTab,
  ChatRoom,
  GetChatRoomsRequest,
  AddOpenChatStore,
  RemoveOpenChatStore,
  AddMinimizedChatStore,
  RemoveMinimizedChatStore
} from '@models/chat';

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

  menuStatus = this.eMenuStatus.EXPANDED_FULL;
  selectedChatOption = this.eChatType.ROOM;

  // Search
  search = '';

  // Friends
  friends$: Observable<Friend[]>;

  // Tabs
  openChats$: Observable<ChatTab[]>;
  tabs: ChatTab[] = [];
  minimizedChats$: Observable<ChatTab[]>;
  minimizedTabs: ChatTab[] = [];
  chatRooms$: Observable<ChatRoom[]>;

  constructor(
    private store$: Store<RootStoreState.State>,
    private chatService: ChatService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );
    this.chatRooms$ = this.store$.pipe(
      select(ChatStoreSelectors.selectChatRooms)
    );
    this.openChats$ = this.store$.pipe(
      select(ChatStoreSelectors.selectOpenChats)
    );
    this.openChats$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((tabs: ChatTab[]) => {
        this.tabs = tabs;
      });
    this.minimizedChats$ = this.store$.pipe(
      select(ChatStoreSelectors.selectMinimizedChats)
    );
    this.minimizedChats$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((tabs: ChatTab[]) => {
        this.minimizedTabs = tabs;
      });

    // Get All Rooms
    const getChatRoomsRequest: GetChatRoomsRequest = {};
    this.store$.dispatch(
      new ChatStoreActions.GetChatRoomsRequestAction(getChatRoomsRequest)
    );
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
    if (this.tabs.length >= 3) {
      const firstTab = this.tabs[0];
      this.minimizeTab(firstTab.tabId);
    }
  }

  // Check the inner chat id, as the tabId will be diff
  tabExists(chatId: string): boolean {
    // If already open do nothing // TODO: select it
    const tab = this.tabs.filter((t) => t.chat?.id === chatId);
    if (tab.length > 0) {
      return true;
    }
    // Check the minimized tabs
    const mtab = this.minimizedTabs.filter((t) => t.chat?.id === chatId);
    if (mtab.length > 0) {
      this.checkTooManyTabs();
      this.openMinimizedTab(mtab[0].tabId);
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
    const newTab: ChatTab = {
      tabId: uuidv4(),
      name: friend.username,
      imageSrc: friend.profilePictureSrc,
      type: ChatType.FRIEND,
      chat: null
    };
    const request: AddOpenChatStore = {
      tab: newTab
    };
    this.store$.dispatch(new ChatStoreActions.AddOpenChatStoreAction(request));
  }

  createRoomTab(room: ChatRoom) {
    // check if the tab exists already
    if (this.tabExists(room.id)) {
      return;
    }
    this.checkTooManyTabs();
    const newTab: ChatTab = {
      tabId: uuidv4(),
      name: room.name,
      imageSrc: room.imageSrc,
      type: ChatType.ROOM,
      chat: room
    };
    const request: AddOpenChatStore = {
      tab: newTab
    };
    this.store$.dispatch(new ChatStoreActions.AddOpenChatStoreAction(request));
  }

  openMinimizedTab(id: string) {
    // get the tab
    const tab = this.minimizedTabs.filter((elem: ChatTab) => elem.tabId === id);
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
      tabId: id
    };
    this.store$.dispatch(
      new ChatStoreActions.RemoveMinimizedChatStoreAction(removeRequest)
    );
  }

  minimizeTab = (id: string) => {
    // get the tab
    const tab = this.tabs.filter((elem: ChatTab) => elem.tabId === id);
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

  closeTab = (id: string) => {
    const request: RemoveOpenChatStore = {
      tabId: id
    };
    this.store$.dispatch(
      new ChatStoreActions.RemoveOpenChatStoreAction(request)
    );
  };

  getMinimizedName(name: string) {
    if (name) {
      return name.substring(0, 1).toUpperCase();
    }
  }

  searchRooms() {}

  createRoom() {
    this.modalService
      .open('global', 'chatCreate')
      .pipe(take(1))
      .subscribe((result) => {
        // Open the room, if a room was created
      });
  }
}
