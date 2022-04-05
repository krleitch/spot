import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  AfterViewChecked,
  ViewChild,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { take } from 'rxjs/operators';
import { Channel as PhoenixChannel } from 'phoenix';

// Services
import { ChatService } from '@services/chat.service';

// Assets
import {
  MessageBlock,
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
  @ViewChild('chat') chat: ElementRef<HTMLElement>; // chat messages container
  @ViewChild('create') create: ElementRef; // editable content
  @ViewChild('anchor') anchor: ElementRef<HTMLElement>; // On scroll trigger
  @Input() chatRoom: ChatRoom;

  private observer: IntersectionObserver;

  currentLength = 0;
  channel: PhoenixChannel;
  messageBlocks: MessageBlock[] = [];
  beforeCursor: string = null;
  disableScrollDown = false;
  ignoreInitialObserver = true;

  constructor(
    private chatService: ChatService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.channel = this.chatService.connectToChannel(this.chatRoom.id);
    this.joinRoom();
  }

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(([entry]) => {
      if (
        entry.isIntersecting &&
        this.beforeCursor &&
        !this.ignoreInitialObserver
      ) {
        const request: GetMessagesRequest = {
          roomId: this.chatRoom.id,
          before: this.beforeCursor
        };
        this.chatService
          .getMessages(request)
          .pipe(take(1))
          .subscribe((response: GetMessagesResponse) => {
            // save old offsets
            const preScrollHeight = this.chat.nativeElement.scrollHeight;
            const preScrollOffset = this.chat.nativeElement.scrollTop;

            // update data
            this.messageBlocks = response.messages.concat(this.messageBlocks);
            this.beforeCursor = response.pagination.after;

            // update so we can get the new offsets
            this.changeDetectorRef.detectChanges();

            // check if we need to fix the scroll
            // firefox and chrome are smart, safari not so much
            const postScrollOffset = this.chat.nativeElement.scrollTop;

            if (preScrollOffset === postScrollOffset) {
              // the browser didnt help us
              const postScrollHeight = this.chat.nativeElement.scrollHeight;
              const deltaHeight = postScrollHeight - preScrollHeight;

              this.chat.nativeElement.scrollTop =
                postScrollOffset + deltaHeight;
            }
          });
      } else {
        this.ignoreInitialObserver = false;
      }
    });
    this.observer.observe(this.anchor.nativeElement);
  }

  scrollChatToBottom() {
    if (this.disableScrollDown) {
      return;
    }
    try {
      this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
    } catch (err) {
      // None
    }
  }

  ngAfterViewChecked() {
    this.scrollChatToBottom();
  }

  onScroll() {
    const element = this.chat.nativeElement;
    const threshold = 0;
    const atBottom =
      element.scrollHeight - element.scrollTop - threshold <=
      element.clientHeight;
    if (atBottom) {
      this.disableScrollDown = false;
    } else {
      this.disableScrollDown = true;
    }
  }

  formatTimestamp(timestamp: string): string {
    const time = new Date(timestamp);
    const days = ['Sun', 'Mon', 'Tue', 'Web', 'Thu', 'Fri', 'Sat'];
    const minutes = time.getMinutes();
    const hours = time.getHours();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const daysStr = days[time.getDay()];
    const hoursStr = hours % 12 ? (hours % 12).toString() : '12'; // 0 hour should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
    const strTime = daysStr + ' ' + hoursStr + ':' + minutesStr + ' ' + ampm;
    return strTime;
  }

  getProfilePictureClass(index, owned: boolean): string {
    let str = '';
    if (index === -1) {
      str += 'profile-sm profile-position profile-op';
    } else {
      str += 'profile-sm profile-position profile-' + index;
    }
    if (owned) {
      str += ' owned';
    }
    return str;
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

  onEnter(): boolean {
    this.submit();
    return false;
  }

  submit(): void {
    const content = this.create.nativeElement.innerHTML;

    const newMessage: CreateMessage = {
      text: content
    };
    this.channel
      .push('new_message', newMessage, 10000)
      .receive('ok', (_msg) => {
        // console.log('created message', msg);
        this.create.nativeElement.innerHTML = '';
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
          messages: MessageBlock[];
          pagination: ChatPagination;
        }) => {
          console.log(messages);
          this.messageBlocks = messages;
          this.beforeCursor = pagination.after;
        }
      )
      .receive('error', ({ reason }) => {
        console.log('failed join', reason);
      })
      .receive('timeout', () => {
        console.log('Networking issue. Still waiting...');
      });

    this.channel.on('message_created', (message: Message) => {
      // determine if we need to add a new block or append to last block
      if (this.messageBlocks.length > 0) {
        const lastBlock = this.messageBlocks[this.messageBlocks.length - 1];
        const tooLate =
          new Date(message.insertedAt).getTime() -
            new Date(
              lastBlock.messages[lastBlock.messages.length - 1].insertedAt
            ).getTime() >
          300000;
        if (lastBlock.chatProfileId === message.chatProfileId && !tooLate) {
          // Append to this block
          this.messageBlocks[this.messageBlocks.length - 1].messages =
            lastBlock.messages.concat({
              id: message.id,
              text: message.text,
              insertedAt: message.insertedAt
            });
        } else {
          // create a new block
          this.messageBlocks.push({
            insertedAt: message.insertedAt,
            owned: message.owned,
            profilePictureNum: message.profilePictureNum,
            profilePictureSrc: message.profilePictureSrc,
            chatProfileId: message.chatProfileId,
            messages: [
              {
                id: message.id,
                text: message.text,
                insertedAt: message.insertedAt
              }
            ]
          });
        }
      } else {
        // create the first block
        this.messageBlocks.push({
          insertedAt: message.insertedAt,
          owned: message.owned,
          profilePictureNum: message.profilePictureNum,
          profilePictureSrc: message.profilePictureSrc,
          chatProfileId: message.chatProfileId,
          messages: [
            {
              id: message.id,
              text: message.text,
              insertedAt: message.insertedAt
            }
          ]
        });
      }
    });
  }

  leaveRoom(): void {
    this.chatService.disconnectFromChannel(this.channel);
  }

  showDate(index: number): boolean {
    // If its the first message
    if (index === 0) {
      return true;
    }
    const messageBlock = this.messageBlocks[index];
    const previousMessageBlock = this.messageBlocks[index - 1];
    // if time difference is greater than 5 minutes
    return (
      new Date(messageBlock.insertedAt).getTime() -
        new Date(previousMessageBlock.insertedAt).getTime() >
      300000
    );
  }
}
