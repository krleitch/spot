import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { SocialStoreSelectors } from '@store/social-store';

// Models
import { Friend } from '@models/friends';
import { ChatType, Tab } from '@models/chat';
@Component({
  selector: 'spot-chat-menu',
  templateUrl: './chat-menu.component.html',
  styleUrls: ['./chat-menu.component.scss']
})
export class ChatMenuComponent implements OnInit {
  eChatType = ChatType;

  menuExpanded = true;
  selectedChatOption = this.eChatType.FRIEND;

  // Friends
  friends$: Observable<Friend[]>;

  // Tabs
  tabs: Tab[] = [];
  minimizedTabs: Tab[] = [];

  constructor(private store$: Store<RootStoreState.State>) {}

  ngOnInit(): void {
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );
  }

  toggleMenu() {
    this.menuExpanded = !this.menuExpanded;
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

  createTab(type: ChatType, name: string) {
    // check if the tab exists already
    const newTab: Tab = {
      id: uuidv4(),
      name: name,
      type: type
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
}
