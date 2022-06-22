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

// Assets
import {
  FriendMessageBlock,
  FriendMessage,
  CreateFriendMessage,
  GetFriendMessagesRequest,
  GetFriendMessagesResponse,
  ChatPagination
} from '@models/chat';
import { User } from '@models/user';
import { UserMetadata } from '@models/userMetadata';
import { Friend } from '@models/friend';

@Component({
  selector: 'spot-chat-friend',
  templateUrl: './chat-friend.component.html',
  styleUrls: ['./chat-friend.component.scss']
})
export class ChatFriendComponent
  implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy, OnChanges
{
  private readonly onDestroy = new Subject<void>();
  // Chat Text Content
  @ViewChild('chat') chat: ElementRef<HTMLElement>; // chat messages container
  @ViewChild('create') create: ElementRef; // editable content
  @ViewChild('anchor') anchor: ElementRef<HTMLElement>; // On scroll trigger
  @Input() chatFriend: Friend;
  @Input() isTab: boolean;

  private observer: IntersectionObserver;

  channel: PhoenixChannel;
  messageBlocks: FriendMessageBlock[] = [];
  beforeCursor: string = null;

  // state
  disableScrollDown = false;
  ignoreInitialObserver = true;
  userCount = 0;
  currentLength = 0;

  // User Metadata
  userMetadata$: Observable<UserMetadata>;
  userMetadata: UserMetadata;
  user$: Observable<User>;
  user: User;

  constructor(
    private store$: Store<RootStoreState.State>,
    private chatService: ChatService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.channel = this.chatService.connectToFriendChannel(this.chatFriend.friendId);
    this.joinRoom();

    // user
    this.user$ = this.store$.pipe(
      select(UserStoreSelectors.selectUser)
    );
    this.user$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((user: User) => {
        this.user = user;
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

  ngOnChanges(_changes: SimpleChanges): void {
    this.channel = this.chatService.connectToFriendChannel(this.chatFriend.friendId);
    this.joinRoom();
  }

  ngAfterViewInit() {
    this.observer = new IntersectionObserver(([entry]) => {
      if (
        entry.isIntersecting &&
        this.beforeCursor &&
        !this.ignoreInitialObserver
      ) {
        const request: GetFriendMessagesRequest = {
          roomId: this.chatFriend.friendId,
          before: this.beforeCursor
        };
        this.chatService
          .getFriendMessages(request)
          .pipe(take(1))
          .subscribe((response: GetFriendMessagesResponse) => {
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

  formatTimestamp(timestamp: string): string {
    const time = new Date(timestamp);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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

    const content = this.create.nativeElement.innerHTML;

    const newMessage: CreateFriendMessage = {
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
          messages: FriendMessageBlock[];
          pagination: ChatPagination;
        }) => {
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
      return name.substring(0, 1).toUpperCase();
    }
  }

  // Disconnect
  disconnectRoom(): void {
    this.chatService.disconnectFromChannel(this.channel);
  }
}
