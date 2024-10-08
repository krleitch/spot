import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  AfterViewChecked,
  ViewChild,
  Input,
  ChangeDetectorRef,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Observable, Subject, timer, Subscription } from 'rxjs';
import { take, takeUntil, takeWhile } from 'rxjs/operators';

// Store
import { select, Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import { UserStoreSelectors } from '@store/user-store';
import { ChatStoreActions } from '@store/chat-store';

// phoenix
import { Channel as PhoenixChannel, Presence } from 'phoenix';

// Services
import { ChatService } from '@services/chat.service';

// helpers
import { getFormattedTime } from '@helpers/util';

// Assets
import {
  MessageBlock,
  Message,
  CreateMessage,
  ChatRoom,
  GetMessagesRequest,
  GetMessagesResponse,
  ChatPagination,
  LeaveChatRoomRequest,
  LeaveChatRoomResponse,
  RemoveUserChatRoomStore
} from '@models/chat';
import { UserMetadata } from '@models/userMetadata';

@Component({
  selector: 'spot-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent
  implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy, OnChanges
{
  private readonly onDestroy = new Subject<void>();
  // Chat Text Content
  @ViewChild('chat') chat: ElementRef<HTMLElement>; // chat messages container
  @ViewChild('create') create: ElementRef; // editable content
  @ViewChild('anchor') anchor: ElementRef<HTMLElement>; // On scroll trigger
  @Input() chatRoom: ChatRoom;
  @Input() isTab: boolean;

  private observer: IntersectionObserver;

  channel: PhoenixChannel;
  messageBlocks: MessageBlock[] = [];
  beforeCursor: string = null;

  // state
  joinError = false; // if there was a problem joining the room
  disableScrollDown = false;
  ignoreInitialObserver = true;
  userCount = 0;
  currentLength = 0;

  // Time / countdown
  showCountdown = false;
  countDown: Subscription;
  counter: number;
  tick = 1000;
  timeMessage: string;
  chatExpired = false;

  // User Metadata
  userMetadata$: Observable<UserMetadata>;
  userMetadata: UserMetadata;

  constructor(
    private store$: Store<RootStoreState.State>,
    private chatService: ChatService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.channel = this.chatService.connectToChannel(this.chatRoom.id);
    this.joinRoom();

    // metadata
    this.userMetadata$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserMetadata)
    );
    this.userMetadata$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((userMetadata: UserMetadata) => {
        this.userMetadata = userMetadata;
      });

    this.timeMessage = getFormattedTime(this.chatRoom.insertedAt);
  }

  ngOnChanges(_changes: SimpleChanges): void {
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

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  ngAfterViewChecked() {
    this.scrollChatToBottom();
  }

  scrollChatToBottom(): void {
    if (this.disableScrollDown) {
      return;
    }
    try {
      this.chat.nativeElement.scrollTop = this.chat.nativeElement.scrollHeight;
    } catch (err) {
      // None
    }
  }

  onScroll(_event: Event) {
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

  startTimer() {
    this.countDown = timer(0, 1000)
      .pipe(
        takeUntil(this.onDestroy),
        takeWhile((_) => {
          return this.counter >= 0;
        })
      )
      .subscribe(() => {
        if (this.counter <= 0) {
          this.showCountdown = true;
          this.chatExpired = true;
        } else if (this.counter <= 600) {
          // 10 minutes show the timer
          this.showCountdown = true;
          --this.counter;
        } else {
          --this.counter;
        }
      });
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

  onTextInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    // remove <br> if empty
    if (target.textContent.length === 0) {
      this.create.nativeElement.innerHTML = '';
    }
    // Need to count newlines as a character, -1 because the first line is free
    this.currentLength = Math.max(
      0,
      target.textContent.length + target.childNodes.length - 1
    );
  }

  onEnter(): boolean {
    this.submit();
    return false;
  }

  submit(): void {
    if (this.chatExpired) {
      // return;
    }

    const content = this.create.nativeElement.innerHTML;

    const newMessage: CreateMessage = {
      text: content
    };
    this.channel
      .push('new_message', newMessage, 10000)
      .receive('ok', (_msg) => {
        this.create.nativeElement.innerHTML = '';
      })
      .receive('error', (reasons) => {
        console.log('create failed', reasons);
      })
      .receive('timeout', () => {
        console.log('Networking issue...');
      });
  }

  syncPresentCount = (presences: object): void => {
    let count = 0;
    Presence.list(presences, (_id, { metas: [_first, ..._rest] }) => {
      count += 1;
    });
    this.userCount = count;
  };

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
          this.messageBlocks = messages;
          this.beforeCursor = pagination.after;

          // check last message time or if no messages when the room is created
          const lastActiveTime = this.messageBlocks.length
            ? this.messageBlocks[this.messageBlocks.length - 1].insertedAt
            : this.chatRoom.insertedAt;
          const currentTime = new Date();
          const timeDiff =
            currentTime.getTime() - new Date(lastActiveTime).getTime();
          this.counter = Math.max(0, 3600000 - timeDiff) / 1000;

          // start the timer
          // this.startTimer();
        }
      )
      .receive('error', ({ reason }) => {
        // TODO: make this error actually mean something
        // ideally you see the chat is full or out of range before you even click on the room
        this.joinError = true;
      })
      .receive('timeout', () => {
        // none
        this.joinError = true;
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
          this.pushMessageBlock(message, tooLate);
        }
      } else {
        // create the first block
        this.pushMessageBlock(message, true);
      }
      // reset the counter on new messages
      this.counter = 3600;
      this.showCountdown = false;
    });
  }

  private pushMessageBlock(message: Message, showDate: boolean): void {
    this.messageBlocks.push({
      insertedAt: message.insertedAt,
      owned: message.owned,
      profilePictureNum: message.profilePictureNum,
      profilePictureSrc: message.profilePictureSrc,
      chatProfileId: message.chatProfileId,
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

  leaveChatRoom(): void {
    const leaveChatRoom: LeaveChatRoomRequest = {
      chatRoomId: this.chatRoom.id
    };
    this.chatService
      .leaveChatRoom(leaveChatRoom)
      .pipe(take(1))
      .subscribe((response: LeaveChatRoomResponse) => {
        this.disconnectRoom();
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

  // Disconnect
  disconnectRoom(): void {
    this.chatService.disconnectFromChannel(this.channel);
  }
}
