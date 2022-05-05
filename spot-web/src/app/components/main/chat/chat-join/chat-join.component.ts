import { Input, Component, OnInit } from '@angular/core';

// models
import { ChatRoom } from '@models/chat';

@Component({
  selector: 'spot-chat-join',
  templateUrl: './chat-join.component.html',
  styleUrls: ['./chat-join.component.scss']
})
export class ChatJoinComponent implements OnInit {
  @Input() chatRoom: ChatRoom;
  constructor() {}

  ngOnInit(): void {
    console.log(this.chatRoom);
  }

  joinRoom() {}
}
