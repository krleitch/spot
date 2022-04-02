import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  AfterViewChecked,
  ViewChild,
  Input
} from '@angular/core';
import { take } from 'rxjs/operators';

import { ChatService } from '@services/chat.service';

// Assets
import {
  Message,
  CreateMessage,
  ChatRoom,
  GetMessagesRequest,
  GetMessagesResponse,
  ChatPagination
} from '@models/chat';

@Component({
  selector: 'spot-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{
  // Chat Text Content
  @ViewChild('chat') chat: ElementRef<HTMLElement>;
  @ViewChild('create') create: ElementRef;
  @ViewChild('anchor') anchor: ElementRef<HTMLElement>;
  @Input() chatRoom: ChatRoom;

  private observer: IntersectionObserver;

  currentLength = 0;
  channel: any;
  messages: Message[] = [];
  beforeCursor: string = null;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.channel = this.chatService.connectToChannel(this.chatRoom.id);
    this.channel.on('new_message', (payload: Message) => {
      this.messages.push(payload);
      // scroll to top
    });
    this.joinRoom();
  }

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && this.beforeCursor) {
        const request: GetMessagesRequest = {
          roomId: this.chatRoom.id,
          before: this.beforeCursor
        };
        this.chatService
          .getMessages(request)
          .pipe(take(1))
          .subscribe((response: GetMessagesResponse) => {
            // null
          });
      } else {
        // none
      }
    });
    this.observer.observe(this.anchor.nativeElement);
    this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
  }

  ngAfterViewChecked() {}

  formatTimestamp(timestamp): string {
    const time = new Date(timestamp);
    return (
      time.getHours().toString() +
      ':' +
      time.getMinutes().toString() +
      ':' +
      time.getSeconds().toString()
    );
  }

  getProfilePictureClass(index): string {
    return this.chatService.getProfilePictureClass(index);
  }

  onTextInput(event): void {
    // remove <br> if empty
    if (event.target.textContent.length === 0) {
      this.create.nativeElement.innerHTML = '';
    }
    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = Math.max(
      0,
      event.target.textContent.length + event.target.childNodes.length - 1
    );
  }

  submit(): void {
    const content = this.create.nativeElement.innerHTML;
    const newMessage: CreateMessage = {
      text: content
    };
    this.channel
      .push('new_message', newMessage, 10000)
      .receive('ok', (msg) => {
        console.log('created message', msg);
      })
      .receive('error', (reasons) => {
        console.log('create failed', reasons);
      })
      .receive('timeout', () => {
        console.log('Networking issue...');
      });
  }

  joinRoom(): void {
    this.channel
      .join()
      .receive(
        'ok',
        ({
          messages,
          pagination
        }: {
          messages: Message[];
          pagination: ChatPagination;
        }) => {
          this.messages = messages.reverse();
          this.beforeCursor = pagination.before;
        }
      )
      .receive('error', ({ reason }) => {
        console.log('failed join', reason);
      })
      .receive('timeout', () => {
        console.log('Networking issue. Still waiting...');
      });

    this.channel.on('message_created', (message) => {
      this.messages.push(message);
    });
  }

  leaveRoom(): void {
    this.chatService.disconnectFromChannel(this.channel);
  }
}
