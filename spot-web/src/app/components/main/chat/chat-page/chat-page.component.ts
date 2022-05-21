import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
  RemoveMinimizedChatStore
} from '@models/chat';
import { LocationData } from '@models/location';

@Component({
  selector: 'spot-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  @ViewChild(ChatRoomComponent) room: ChatRoomComponent;

  chatPageOpenChat$: Observable<ChatRoom>;
  chatPageOpenChat: ChatRoom;
  chatPageMinimizedChats$: Observable<ChatRoom[]>;
  chatPageMinimizedChats: ChatRoom[];

  constructor(
    private store$: Store<RootStoreState.State>,
    private chatService: ChatService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
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
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
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

  openMinimizedChat(chat: ChatRoom): void {
    // if a chat is open then close it first
    if (this.chatPageOpenChat) {
      this.room.leaveRoom();
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
      this.store$.dispatch(
        new ChatStoreActions.AddPageMinimizedChatStoreAction(addRequest)
      );
      const removeRequest: RemovePageOpenChatStore = {};
      this.store$.dispatch(
        new ChatStoreActions.RemovePageOpenChatStoreAction(removeRequest)
      );
    }
  }

}
