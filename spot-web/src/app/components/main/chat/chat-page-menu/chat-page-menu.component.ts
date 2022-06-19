import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
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

// Services
import { ChatService } from '@services/chat.service';
import { ModalService } from '@services/modal.service';

// Models
import { Friend } from '@models/friend';
import {
  ChatType,
  ChatRoom,
  ChatTab,
  SetPageOpenChatStore,
  RemovePageOpenChatStore,
  AddPageMinimizedChatStore,
  RemovePageMinimizedChatStore,
  RemoveMinimizedChatStore,
  GetUserChatRoomsRequest
} from '@models/chat';
import { LocationData } from '@models/location';

enum SelectedPage {
  FRIENDS = 'FRIENDS',
  CHATS = 'CHATS'
}

@Component({
  selector: 'spot-chat-page-menu',
  templateUrl: './chat-page-menu.component.html',
  styleUrls: ['./chat-page-menu.component.scss']
})
export class ChatPageMenuComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  eSelectedPage = SelectedPage;

  selectedPage = SelectedPage.CHATS;

  // Search
  search = '';

  // location
  showLocationIndicator$: Observable<boolean>;
  location$: Observable<LocationData>;
  location: LocationData;
  locationLoading$: Observable<boolean>;
  locationLoading: boolean;

  // minimized chats
  chatPageMinimizedChats$: Observable<ChatTab[]>;
  chatPageMinimizedChats: ChatTab[];

  @Output() chatSelectedEvent = new EventEmitter<ChatRoom>();

  // Friends
  friends$: Observable<Friend[]>;

  // Chats
  userChatRooms$: Observable<ChatRoom[]>;
  userChatRooms: ChatRoom[];

  constructor(
    private store$: Store<RootStoreState.State>,
    private chatService: ChatService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    // friends
    this.friends$ = this.store$.pipe(
      select(SocialStoreSelectors.selectFriends)
    );

    // chat rooms
    this.userChatRooms$ = this.store$.pipe(
      select(ChatStoreSelectors.selectUserChatRooms)
    );
    this.userChatRooms$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((chats: ChatRoom[]) => {
        // Make a copy so its not read only and the sort directive can edit it
        this.userChatRooms = [...chats];
      });

    // minimized chats
    this.chatPageMinimizedChats$ = this.store$.pipe(
      select(ChatStoreSelectors.selectChatPageMinimizedChats)
    );
    this.chatPageMinimizedChats$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((chats: ChatTab[]) => {
        this.chatPageMinimizedChats = chats;
      });

    // location
    this.location$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocation)
    );
    this.location$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((location: LocationData) => {
        this.location = location;
        if (this.location) {
          // Get All Rooms
          const getUserChatRoomsRequest: GetUserChatRoomsRequest = {
            lat: this.location.latitude,
            lng: this.location.longitude
          };
          this.store$.dispatch(
            new ChatStoreActions.GetUserChatRoomsRequestAction(
              getUserChatRoomsRequest
            )
          );
        }
      });

    this.locationLoading$ = this.store$.pipe(
      select(UserStoreSelectors.selectLocationLoading)
    );
    this.locationLoading$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((locationLoading: boolean) => {
        this.locationLoading = locationLoading;
        if (this.locationLoading) {
          this.showLocationIndicator$ = timer(500)
            .pipe(
              mapTo(true),
              takeWhile((_) => this.locationLoading)
            )
            .pipe(startWith(false));
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  selectChatRooms(): void {
    this.selectedPage = SelectedPage.CHATS;
  }
  selectFriends(): void {
    this.selectedPage = SelectedPage.FRIENDS;
  }

  discoverRooms() {
    this.modalService
      .open('chat-menu', 'chatDiscover', {}, { width: 600, height: 'auto' })
      .pipe(take(1))
      .subscribe((_result) => {
        // Open the room, if a room was created
      });
  }

  createRoom() {
    this.modalService
      .open('chat-menu', 'chatCreate')
      .pipe(take(1))
      .subscribe((_result) => {
        // Open the room, if a room was created
      });
  }

  openChat(chat: ChatRoom): void {
    this.chatSelectedEvent.emit(chat);
  }
}
