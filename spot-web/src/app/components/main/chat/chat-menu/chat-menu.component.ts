import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { take } from 'rxjs/operators';

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
import { ChatType, Tab, ChatRoom, GetChatRoomsRequest } from '@models/chat';

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
export class ChatMenuComponent implements OnInit {
  eMenuStatus = MenuStatus;
  eChatType = ChatType;

  menuStatus = this.eMenuStatus.EXPANDED_FULL;
  selectedChatOption = this.eChatType.ROOM;

  // Search
  search = '';

  // Friends
  friends$: Observable<Friend[]>;

  // Tabs
  tabs: Tab[] = [];
  minimizedTabs: Tab[] = [];
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

    const getChatRoomsRequest: GetChatRoomsRequest = {};
    this.store$.dispatch(
      new ChatStoreActions.GetChatRoomsRequestAction(getChatRoomsRequest)
    );
  }

  setMenuStatus(menuStatus: MenuStatus) {
    this.menuStatus = menuStatus;
  }

  toggleMenu() {
    if (this.menuStatus === MenuStatus.HIDDEN) {
      this.menuStatus = MenuStatus.EXPANDED_FULL;
    } else if (this.menuStatus === MenuStatus.EXPANDED_SEMI) {
      this.menuStatus = MenuStatus.HIDDEN;
    } else if (this.menuStatus === MenuStatus.EXPANDED_FULL) {
      this.menuStatus = MenuStatus.EXPANDED_SEMI;
    }
  }

  selectRooms() {
    this.selectedChatOption = this.eChatType.ROOM;
  }

  selectFriends() {
    this.selectedChatOption = this.eChatType.FRIEND;
  }

  checkMinimizeTabs() {
    // if we add a new tab minimize the lru
  }

  createFriendTab(friend: Friend) {
    // check if the tab exists already
    const newTab: Tab = {
      id: uuidv4(),
      name: friend.username,
      imageSrc: friend.profilePictureSrc,
      type: ChatType.FRIEND
    };
    this.tabs.push(newTab);
  }

  createRoomTab(room: ChatRoom) {
    // check if the tab exists already
    const newTab: Tab = {
      id: uuidv4(),
      name: room.name,
      imageSrc: room.imageSrc,
      type: ChatType.ROOM,
      data: room
    };
    this.tabs.push(newTab);
  }

  openTab(id: string) {
    // get the tab
    const tab = this.minimizedTabs.filter((elem: Tab) => elem.id === id);
    if (!tab) {
      return;
    }
    // add to minimized and remove
    this.tabs.push(tab[0]);
    this.minimizedTabs = this.minimizedTabs.filter(
      (elem: Tab) => elem.id !== id
    );
  }

  minimizeTab = (id: string) => {
    // get the tab
    const tab = this.tabs.filter((elem: Tab) => elem.id === id);
    if (!tab) {
      return;
    }
    // add to minimized and remove
    this.minimizedTabs.push(tab[0]);
    this.tabs = this.tabs.filter((elem: Tab) => elem.id !== id);
  };

  closeTab = (id: string) => {
    this.tabs = this.tabs.filter((elem: Tab) => elem.id !== id);
  };

  closeMinimizedTab(id: string) {
    this.minimizedTabs = this.minimizedTabs.filter(
      (elem: Tab) => elem.id !== id
    );
  }

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
