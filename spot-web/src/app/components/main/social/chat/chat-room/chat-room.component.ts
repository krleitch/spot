import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ChatService } from '@services/chat.service';

// Assets
import { STRINGS } from '@src/assets/strings/en';
import { NewMessage, Message } from '@models/chat';

@Component({
  selector: 'spot-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit {
  STRINGS = STRINGS.MAIN.CHAT_ROOM;

  // Chat Text Content
  @ViewChild('chat') chat: ElementRef;
  joined = false;
  currentLength = 0;
  channel: any;
  messages: Message[] = [];

  constructor(private chatService: ChatService) {
    this.channel = chatService.getChannel('chat_room:lobby', 'token');
    this.channel.on('new_message', (payload: Message) => {
      this.messages.push(payload);
      // scroll to top
    })
    this.joinRoom();
  }

  ngOnInit(): void {
  }

  formatTimestamp(timestamp): string {
    const time = new Date(timestamp);
    return time.getHours().toString() + ':' + time.getMinutes().toString() + ':' + time.getSeconds().toString();
  }

  getProfilePictureClass(index): string {
    return this.chatService.getProfilePictureClass(index);
  }

  onTextInput(event): void {
    // remove <br> if empty
    if (event.target.textContent.length === 0) {
      this.chat.nativeElement.innerHTML = '';
    }
    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = Math.max(
      0,
      event.target.textContent.length + event.target.childNodes.length - 1
    );
  }

  submit(): void {
    const content = this.chat.nativeElement.innerHTML;
    const newMessage: NewMessage = {
      content: content
    }
    this.channel.push("new_message", newMessage, 10000)
      .receive("ok", (msg) => {
        console.log("created message", msg) 
      })
      .receive("error", (reasons) => {
        console.log("create failed", reasons) 
      })
      .receive("timeout", () => {
        console.log("Networking issue...") 
      })
  }

  joinRoom(): void {
    this.channel
    .join()
    .receive('ok', ({ messages }) => {
      console.log('catching up', messages)
      this.joined = true;
    })
    .receive('error', ({ reason }) => {
      console.log('failed join', reason)
    })
    .receive('timeout', () => {
      console.log('Networking issue. Still waiting...')
    });
  }

}
