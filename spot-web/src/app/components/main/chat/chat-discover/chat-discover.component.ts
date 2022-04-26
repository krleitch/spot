import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { take, takeUntil, mapTo, startWith, takeWhile } from 'rxjs/operators';

// Store
import { Store, select } from '@ngrx/store';
import { RootStoreState } from '@store';
// import { SocialStoreSelectors } from '@store/social-store';
import { ChatStoreSelectors, ChatStoreActions } from '@store/chat-store';
import { UserStoreSelectors } from '@src/app/root-store/user-store';

// services
import { ChatService } from '@services/chat.service';
import { ModalService } from '@services/modal.service';
import { TranslateService } from '@ngx-translate/core';

// models
import { ModalData } from '@models/modal';
import {
  GetChatRoomsRequest,
  ChatRoom,
  JoinChatRoomRequest,
  JoinChatRoomResponse,
  AddOpenChatStore,
  AddChatRoomStore
} from '@models/chat';
import { LocationData } from '@models/location';
import { UserMetadata, UnitSystem } from '@models/userMetadata';

@Component({
  selector: 'spot-chat-discover',
  templateUrl: './chat-discover.component.html',
  styleUrls: ['./chat-discover.component.scss']
})
export class ChatDiscoverComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  // Modal properties
  data: ModalData;
  modalId: string;

  // Rooms
  chatRooms$: Observable<ChatRoom[]>;
  chatRooms: ChatRoom[];
  loadingChatRooms$: Observable<boolean>;
  loadingChatRooms: boolean;

  // location
  location$: Observable<LocationData>;
  location: LocationData;

  // search string
  search: string;

  // User Metadata
  userMetadata$: Observable<UserMetadata>;
  userMetadata: UserMetadata;

  // state
  errorMessage: string;
  showLoadingIndicator: Observable<boolean>;
  selectedRow: number;
  selectedChat: ChatRoom;

  STRINGS;

  constructor(
    private modalService: ModalService,
    private chatService: ChatService,
    private store$: Store<RootStoreState.State>,
    private translateService: TranslateService
  ) {
    this.translateService.get('MAIN.CHAT_DISCOVER').subscribe((res: any) => {
      this.STRINGS = res;
    });
  }

  ngOnInit(): void {
    // metadata
    this.userMetadata$ = this.store$.pipe(
      select(UserStoreSelectors.selectUserMetadata)
    );
    this.userMetadata$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((userMetadata: UserMetadata) => {
        this.userMetadata = userMetadata;
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
          const getChatRoomsRequest: GetChatRoomsRequest = {
            lat: this.location.latitude,
            lng: this.location.longitude
          };
          this.store$.dispatch(
            new ChatStoreActions.GetChatRoomsRequestAction(getChatRoomsRequest)
          );
        }
      });

    // Chat rooms
    this.chatRooms$ = this.store$.pipe(
      select(ChatStoreSelectors.selectChatRooms)
    );
    this.chatRooms$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((chats: ChatRoom[]) => {
        // Make a copy so its not read only and the sort directive can edit it
        this.chatRooms = [...chats];
      });
    this.loadingChatRooms$ = this.store$.pipe(
      select(ChatStoreSelectors.selectLoadingChatRooms)
    );
    this.loadingChatRooms$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loading: boolean) => {
        this.loadingChatRooms = loading;
        this.showLoadingIndicator = timer(500)
          .pipe(
            mapTo(true),
            takeWhile(() => this.loadingChatRooms)
          )
          .pipe(startWith(false));
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  getDistance(distance: number): string {
    let unit: UnitSystem;
    if (this.userMetadata) {
      unit = this.userMetadata.unitSystem;
    } else {
      unit = UnitSystem.IMPERIAL;
    }

    let distanceString = '';

    if (unit === UnitSystem.METRIC) {
      distanceString += (distance * 1.60934).toFixed(1) + ' km';
    } else {
      distanceString += distance.toFixed(1) + ' m';
    }

    return distanceString;
  }

  joinChatRoom(id: string): void {
    const joinChatRoom: JoinChatRoomRequest = {
      lat: this.location.latitude,
      lng: this.location.longitude,
      chatRoomId: id
    };
    this.chatService
      .joinChatRoom(joinChatRoom)
      .pipe(take(1))
      .subscribe(
        (response: JoinChatRoomResponse) => {
          // add to open
          const addRequest: AddOpenChatStore = {
            chat: response.chatRoom
          };
          this.store$.dispatch(
            new ChatStoreActions.AddOpenChatStoreAction(addRequest)
          );
          // add to menu
          const request: AddChatRoomStore = {
            chatRoom: response.chatRoom
          };
          this.store$.dispatch(
            new ChatStoreActions.AddChatRoomStoreAction(request)
          );
          this.close();
        },
        (err) => {
          console.log(err.error.errors);
          if (
            Object.prototype.hasOwnProperty.call(
              err.error.errors,
              'user_id_room_id'
            )
          ) {
            this.errorMessage = this.STRINGS.ERROR_JOINED;
          } else {
            this.errorMessage = this.STRINGS.ERROR;
          }
        }
      );
  }

  refresh(): void {
    if (this.location) {
      this.errorMessage = '';
      const getChatRoomsRequest: GetChatRoomsRequest = {
        lat: this.location.latitude,
        lng: this.location.longitude
      };
      this.store$.dispatch(
        new ChatStoreActions.GetChatRoomsRequestAction(getChatRoomsRequest)
      );
    }
  }

  selectRow(index: number, chat: ChatRoom): void {
    this.selectedRow = index;
    this.selectedChat = chat;
  }

  close(): void {
    this.modalService.close(this.modalId);
  }
}
