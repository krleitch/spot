import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
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
  SetPageOpenChatStore,
  RemovePageOpenChatStore,
  AddPageMinimizedChatStore,
  RemovePageMinimizedChatStore,
  GetUserChatRoomsRequest,
  RemoveMinimizedChatStore,
  RemoveUserChatRoomStore,
  LeaveChatRoomResponse,
  LeaveChatRoomRequest
} from '@models/chat';
import { LocationData } from '@models/location';
import { UserMetadata, UnitSystem } from '@models/userMetadata';

@Component({
  selector: 'spot-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly onDestroy = new Subject<void>();

  @ViewChild(ChatRoomComponent) room: ChatRoomComponent;
  @ViewChild('minimized') minimized: ElementRef;
  maximumMinimized = 3;

  // state
  @ViewChild('settings') settings;
  showDropdown = false;

  chatPageOpenChat$: Observable<ChatRoom>;
  chatPageOpenChat: ChatRoom;
  chatPageMinimizedChats$: Observable<ChatRoom[]>;
  chatPageMinimizedChats: ChatRoom[];

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
      .subscribe((chat: ChatRoom) => {
        this.chatPageOpenChat = chat;
      });
    this.chatPageMinimizedChats$ = this.store$.pipe(
      select(ChatStoreSelectors.selectChatPageMinimizedChats)
    );
    this.chatPageMinimizedChats$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((chats: ChatRoom[]) => {
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

  ngAfterViewInit(): void {
    // minimized chats allowed
    // 20px is padding on header, each chat is 60px with a 7px left margin
    this.maximumMinimized = Math.floor(
      (this.minimized.nativeElement.offsetWidth - 20) / 67
    );
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
      chat: this.chatPageOpenChat
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
        chatId: this.chatPageMinimizedChats[0].id
      };
      this.store$.dispatch(
        new ChatStoreActions.RemovePageMinimizedChatStoreAction(removeRequest)
      );
    }
  }

  openMinimizedChat(chat: ChatRoom): void {
    // if a chat is open then close it first
    if (this.chatPageOpenChat) {
      this.room.leaveRoom();
      this.checkMinimizedRoom();
      const addRequest: AddPageMinimizedChatStore = {
        chat: this.chatPageOpenChat
      };
      this.store$.dispatch(
        new ChatStoreActions.AddPageMinimizedChatStoreAction(addRequest)
      );
    }
    // open the chat and remove form minimized
    const setRequest: SetPageOpenChatStore = {
      chat: chat
    };
    this.store$.dispatch(
      new ChatStoreActions.SetPageOpenChatStoreAction(setRequest)
    );
    const removeRequest: RemoveMinimizedChatStore = {
      chatId: chat.id
    };
    this.store$.dispatch(
      new ChatStoreActions.RemovePageMinimizedChatStoreAction(removeRequest)
    );
  }

  openMenu(): void {
    if (this.chatPageOpenChat) {
      this.room.leaveRoom();
      const addRequest: AddPageMinimizedChatStore = {
        chat: this.chatPageOpenChat
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
    if (
      this.chatPageMinimizedChats.filter((chat) => chat.id === chat.id).length >
      0
    ) {
      const removeRequest: RemoveMinimizedChatStore = {
        chatId: chat.id
      };
      this.store$.dispatch(
        new ChatStoreActions.RemovePageMinimizedChatStoreAction(removeRequest)
      );
    } else {
      // otherwise we may need to remove
      this.checkMinimizedRoom();
    }
    const request: SetPageOpenChatStore = {
      chat: chat
    };
    this.store$.dispatch(
      new ChatStoreActions.SetPageOpenChatStoreAction(request)
    );
  }

  leaveChatRoom(): void {
    const leaveChatRoom: LeaveChatRoomRequest = {
      chatRoomId: this.chatPageOpenChat.id
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
