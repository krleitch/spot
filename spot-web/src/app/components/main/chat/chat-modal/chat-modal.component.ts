import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Observable, Subject, concat, interval, of, timer } from 'rxjs';
import {
  distinctUntilChanged,
  mapTo,
  skipWhile,
  startWith,
  take,
  takeUntil,
  takeWhile
} from 'rxjs/operators';

import { v4 as uuidv4 } from 'uuid';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { SocialStoreSelectors } from '@store/social-store';
import { ChatStoreSelectors, ChatStoreActions } from '@store/chat-store';
import { UserStoreSelectors } from '@src/app/root-store/user-store';

// Components
import { ChatRoomComponent } from '@src/app/components/main/chat/chat-room/chat-room.component';

// Services
import { ChatService } from '@services/chat.service';
import { ModalService } from '@services/modal.service';

// Models
import { Friend } from '@models/friend';
import {
  ChatType,
  ChatRoom,
  ChatTab,
  SetPageOpenChatStore,
  RemovePageOpenChatStore,
  AddPageMinimizedChatStore,
  RemovePageMinimizedChatStore,
  GetUserChatRoomsRequest,
  RemoveMinimizedChatStore
} from '@models/chat';
import { LocationData } from '@models/location';
import { UserMetadata, UnitSystem } from '@models/userMetadata';

@Component({
  selector: 'spot-chat-modal',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.scss']
})
export class ChatModalComponent implements OnInit {
  private readonly onDestroy = new Subject<void>();

  // modal properties
  modalId: string;
  data: any;

  @ViewChild(ChatRoomComponent) room: ChatRoomComponent;
  @ViewChild('minimized') minimized: ElementRef;
  maximumMinimized = 3;

  // state
  @ViewChild('settings') settings;
  showDropdown = false;

  chatPageOpenChat$: Observable<ChatTab>;
  chatPageOpenChat: ChatTab;
  chatPageMinimizedChats$: Observable<ChatTab[]>;
  chatPageMinimizedChats: ChatTab[];

  // User Metadata
  userMetadata$: Observable<UserMetadata>;
  userMetadata: UserMetadata;

  constructor(
    private store$: Store<RootStoreState.State>,
    private chatService: ChatService,
    private modalService: ModalService
  ) {
    document.addEventListener('click', this.offClickHandler.bind(this));
  }

  ngOnInit(): void {
    // chat page
    this.chatPageOpenChat$ = this.store$.pipe(
      select(ChatStoreSelectors.selectChatPageOpenChat)
    );
    this.chatPageOpenChat$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((chat: ChatTab) => {
        this.chatPageOpenChat = chat;
      });
    this.chatPageMinimizedChats$ = this.store$.pipe(
      select(ChatStoreSelectors.selectChatPageMinimizedChats)
    );
    this.chatPageMinimizedChats$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((chats: ChatTab[]) => {
        this.chatPageMinimizedChats = chats;
      });

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

  backToMenu(): void {
    // leave the chat, remove open and add to minimized
    this.room.leaveRoom();
    const addRequest: AddPageMinimizedChatStore = {
      tab: this.chatPageOpenChat
    };
    this.store$.dispatch(
      new ChatStoreActions.AddPageMinimizedChatStoreAction(addRequest)
    );
    const removeRequest: RemovePageOpenChatStore = {};
    this.store$.dispatch(
      new ChatStoreActions.RemovePageOpenChatStoreAction(removeRequest)
    );
  }

  // check if there is room for a new chat to be added, if there isnt close the lru
  checkMinimizedRoom(): void {
    if (this.chatPageMinimizedChats.length >= this.maximumMinimized) {
      const removeRequest: RemoveMinimizedChatStore = {
        tabId: this.chatPageMinimizedChats[0].tabId
      };
      this.store$.dispatch(
        new ChatStoreActions.RemovePageMinimizedChatStoreAction(removeRequest)
      );
    }
  }

  openMinimizedChat(chat: ChatTab): void {
    // if a chat is open then close it first
    if (this.chatPageOpenChat) {
      this.room.leaveRoom();
      this.checkMinimizedRoom();
      const addRequest: AddPageMinimizedChatStore = {
        tab: this.chatPageOpenChat
      };
      this.store$.dispatch(
        new ChatStoreActions.AddPageMinimizedChatStoreAction(addRequest)
      );
    }
    // open the chat and remove form minimized
    const setRequest: SetPageOpenChatStore = {
      tab: chat
    };
    this.store$.dispatch(
      new ChatStoreActions.SetPageOpenChatStoreAction(setRequest)
    );
    const removeRequest: RemoveMinimizedChatStore = {
      tabId: chat.tabId
    };
    this.store$.dispatch(
      new ChatStoreActions.RemovePageMinimizedChatStoreAction(removeRequest)
    );
  }

  openMenu(): void {
    if (this.chatPageOpenChat) {
      this.room.leaveRoom();
      const addRequest: AddPageMinimizedChatStore = {
        tab: this.chatPageOpenChat
      };
      this.checkMinimizedRoom();
      this.store$.dispatch(
        new ChatStoreActions.AddPageMinimizedChatStoreAction(addRequest)
      );
      const removeRequest: RemovePageOpenChatStore = {};
      this.store$.dispatch(
        new ChatStoreActions.RemovePageOpenChatStoreAction(removeRequest)
      );
    }
  }

  openChat(chat: ChatRoom) {
    const tabs = this.chatPageMinimizedChats.filter(
      (tab) => (tab.data as ChatRoom).id === chat.id
    );
    if (tabs.length > 0) {
      const removeRequest: RemoveMinimizedChatStore = {
        tabId: tabs[0].tabId
      };
      this.store$.dispatch(
        new ChatStoreActions.RemovePageMinimizedChatStoreAction(removeRequest)
      );
    } else {
      // otherwise we may need to remove
      this.checkMinimizedRoom();
    }
    const request: SetPageOpenChatStore = {
      tab:
        tabs.length > 0
          ? tabs[0]
          : { tabId: uuidv4(), type: ChatType.ROOM, data: chat }
    };
    this.store$.dispatch(
      new ChatStoreActions.SetPageOpenChatStoreAction(request)
    );
  }

  close(): void {
    this.modalService.close('global');
  }
}
