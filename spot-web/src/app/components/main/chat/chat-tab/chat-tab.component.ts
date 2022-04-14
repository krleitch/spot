import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ChatType, ChatRoom } from '@models/chat';

// Components
import { ChatRoomComponent } from '@src/app/components/main/chat/chat-room/chat-room.component';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
import { SocialStoreSelectors } from '@store/social-store';
import { ChatStoreSelectors, ChatStoreActions } from '@store/chat-store';

// models
import { RemoveOpenChatStore, AddMinimizedChatStore } from '@models/chat';
@Component({
  selector: 'spot-chat-tab',
  templateUrl: './chat-tab.component.html',
  styleUrls: ['./chat-tab.component.scss']
})
export class ChatTabComponent implements OnInit {
  chatExpanded = true;
  @Input() tab: ChatRoom;
  @ViewChild(ChatRoomComponent) room: ChatRoomComponent;
  @Input() minimize: (_id: string) => void;

  constructor(private store$: Store<RootStoreState.State>) {}

  ngOnInit(): void {}

  getMinimizedName(name: string) {
    if (name) {
      return name.substring(0, 1).toUpperCase();
    }
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
}
