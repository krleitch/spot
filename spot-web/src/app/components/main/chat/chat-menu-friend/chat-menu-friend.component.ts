import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// phoenix
import { Channel as PhoenixChannel, Presence } from 'phoenix';

// services
import { ChatService } from '@services/chat.service';

// Assets
import {
  MenuStatus,
  FriendMessageBlock,
  FriendMessage,
  ChatPagination
} from '@models/chat';
import { Friend } from '@models/friend';

@Component({
  selector: 'spot-chat-menu-friend',
  templateUrl: './chat-menu-friend.component.html',
  styleUrls: ['./chat-menu-friend.component.scss']
})
export class ChatMenuFriendComponent implements OnInit {
  @Input() friend: Friend;
  @Input() menuStatus: MenuStatus;
  @Output() outputFriend = new EventEmitter<{
    friend: Friend;
    channel: PhoenixChannel;
  }>();

  eMenuStatus = MenuStatus;

  channel: PhoenixChannel;
  userCount = 0;
  messageBlocks: FriendMessageBlock[];
  lastMessage: string;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.channel = this.chatService.connectToFriendChannel(
      this.friend.friendId
    );
    this.joinRoom();
  }

  syncPresentCount = (presences: object): void => {
    let count = 0;
    Presence.list(presences, (_id, { metas: [_first, ..._rest] }) => {
      count += 1;
    });
    this.userCount = count;
  };

  joinRoom(): void {
    console.log('whaat')
    this.channel
      .join()
      .receive(
        'ok',
        ({
          messages,
          pagination
        }: {
          messages: FriendMessageBlock[];
          pagination: ChatPagination;
        }) => {
          this.messageBlocks = messages;
          if (this.messageBlocks && this.messageBlocks.length > 0) {
            const lastMessages =
              this.messageBlocks[this.messageBlocks.length - 1].messages;
            this.lastMessage = lastMessages[lastMessages.length - 1].text;
          } else {
            this.lastMessage = '-';
          }
        }
      )
      .receive('error', ({ reason }) => {
        console.log('failed join', reason);
      })
      .receive('timeout', () => {
        console.log('Networking issue. Still waiting...');
      });

    let presences = {};
    this.channel.on('presence_state', (state) => {
      presences = Presence.syncState(presences, state);
      this.syncPresentCount(presences);
    });

    this.channel.on('presence_diff', (diff) => {
      presences = Presence.syncDiff(presences, diff);
      this.syncPresentCount(presences);
    });

    this.channel.on('message_created', (message: FriendMessage) => {
      // determine if we need to add a new block or append to last block
      console.log('whatt');
      if (this.messageBlocks.length > 0) {
        const lastBlock = this.messageBlocks[this.messageBlocks.length - 1];
        const tooLate =
          new Date(message.insertedAt).getTime() -
            new Date(
              lastBlock.messages[lastBlock.messages.length - 1].insertedAt
            ).getTime() >
          300000;
        if (lastBlock.owned === message.owned && !tooLate) {
          // Append to this block
          this.messageBlocks[this.messageBlocks.length - 1].messages =
            lastBlock.messages.concat({
              id: message.id,
              text: message.text,
              insertedAt: message.insertedAt
            });
        } else {
          // create a new block
          this.pushMessageBlock(message, tooLate);
        }
      } else {
        // create the first block
        this.pushMessageBlock(message, true);
      }
      if (this.messageBlocks && this.messageBlocks.length > 0) {
        const lastMessages =
          this.messageBlocks[this.messageBlocks.length - 1].messages;
        this.lastMessage = lastMessages[lastMessages.length - 1].text;
      } else {
        this.lastMessage = '-';
      }
    });
  }

  private pushMessageBlock(message: FriendMessage, showDate: boolean): void {
    this.messageBlocks.push({
      insertedAt: message.insertedAt,
      owned: message.owned,
      showDate: showDate,
      messages: [
        {
          id: message.id,
          text: message.text,
          insertedAt: message.insertedAt
        }
      ]
    });
  }

  getMinimizedName(name: string) {
    if (name) {
      return (
        name.substring(0, 1).toUpperCase() + name.substring(1, 2).toLowerCase()
      );
    }
  }

  selectFriend() {
    this.outputFriend.emit({ friend: this.friend, channel: this.channel });
  }
}
