import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ChatService } from '@services/chat.service';

// Assets
import { STRINGS } from '@src/assets/strings/en';

@Component({
  selector: 'spot-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit {
  STRINGS = STRINGS.MAIN.CHAT_ROOM;

  // Chat Text Content
  @ViewChild('chat') chat: ElementRef;
  currentLength = 0;
  channel: any;
  messages = ['TEST'];

  constructor(chatService: ChatService) {
    this.channel = chatService.joinRoom('chat_room:lobby');
    this.channel
    .join()
    .receive('ok', ({ messages }) => console.log('catching up', messages))
    .receive('error', ({ reason }) => console.log('failed join', reason))
    .receive('timeout', () =>
      console.log('Networking issue. Still waiting...')
    );

        // $input.onEnter( e => {
    //   channel.push("new_msg", {body: e.target.val}, 10000)
    //     .receive("ok", (msg) => console.log("created message", msg) )
    //     .receive("error", (reasons) => console.log("create failed", reasons) )
    //     .receive("timeout", () => console.log("Networking issue...") )
    // })
  }

  ngOnInit(): void {}

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
    console.log(content);
  }

}
