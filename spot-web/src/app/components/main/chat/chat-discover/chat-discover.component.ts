import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import {
  take,
  takeUntil,
  mapTo,
  startWith,
  takeWhile,
  finalize
} from 'rxjs/operators';

import { v4 as uuidv4 } from 'uuid';

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
  ChatTab,
  ChatType,
  JoinChatRoomRequest,
  JoinChatRoomResponse,
  AddOpenChatStore,
  AddUserChatRoomStore,
  ChatPagination,
  GetChatRoomsResponse
} from '@models/chat';
import { LocationData } from '@models/location';
import { UserMetadata, UnitSystem } from '@models/userMetadata';
import { ModalChatPasswordResult } from '@models/modal';

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
  chatRooms: ChatRoom[];
  loadingChatRooms: boolean;
  chatRoomsPagination: ChatPagination;

  // location
  location$: Observable<LocationData>;
  location: LocationData;

  // search string
  search = '';

  // User Metadata
  userMetadata$: Observable<UserMetadata>;
  userMetadata: UserMetadata;

  // state
  errorMessage: string;
  showLoadingIndicator: Observable<boolean>;
  selectedRow: number;
  selectedChat: ChatRoom;

  STRINGS: Record<string, string>;

  constructor(
    private modalService: ModalService,
    private chatService: ChatService,
    private store$: Store<RootStoreState.State>,
    private translateService: TranslateService
  ) {
    this.translateService
      .get('MAIN.CHAT_DISCOVER')
      .subscribe((res: Record<string, string>) => {
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
          this.loadingChatRooms = true;
          this.chatService
            .getChatRooms(getChatRoomsRequest)
            .pipe(
              take(1),
              finalize(() => {
                this.loadingChatRooms = false;
              })
            )
            .subscribe((response: GetChatRoomsResponse) => {
              this.chatRooms = response.chatRooms;
              this.chatRoomsPagination = response.pagination;
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  onScroll(): void {
    if (this.chatRoomsPagination.after) {
      const getChatRoomsRequest: GetChatRoomsRequest = {
        lat: this.location.latitude,
        lng: this.location.longitude,
        after: this.chatRoomsPagination.after
      };
      this.chatService
        .getChatRooms(getChatRoomsRequest)
        .pipe(
          take(1),
          finalize(() => {
            this.loadingChatRooms = false;
          })
        )
        .subscribe((response: GetChatRoomsResponse) => {
          this.chatRooms = this.chatRooms.concat(response.chatRooms);
          this.chatRoomsPagination = response.pagination;
        });
    }
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

  getAge(timestamp: string): string {
    const curTime = new Date();
    const chatTime = new Date(timestamp);
    const timeDiff = curTime.getTime() - chatTime.getTime();
    if (timeDiff < 60000) {
      return 'Now';
    } else if (timeDiff < 3600000) {
      const minuteDiff = Math.round(timeDiff / 60000);
      return minuteDiff + 'm';
    } else if (timeDiff < 86400000) {
      const hourDiff = Math.round(timeDiff / 3600000);
      return hourDiff + 'h';
    } else if (timeDiff < 31536000000) {
      const dayDiff = Math.round(timeDiff / 86400000);
      return dayDiff + 'd';
    } else {
      const yearDiff = Math.round(timeDiff / 31536000000);
      return yearDiff + 'y';
    }
  }

  joinChatRoom(chatRoom: ChatRoom) {
    if (chatRoom.private) {
      this.modalService
        .open(
          'chat-password',
          'chatPassword',
          {},
          { disableClose: true, top: 250 }
        )
        .pipe(take(1))
        .subscribe((result: ModalChatPasswordResult) => {
          this.requestJoinRoom(chatRoom, result.password);
        });
    } else {
      this.requestJoinRoom(chatRoom);
    }
  }

  requestJoinRoom(chatRoom: ChatRoom, password?: string): void {
    const joinChatRoom: JoinChatRoomRequest = {
      lat: this.location.latitude,
      lng: this.location.longitude,
      password: password ? password : undefined,
      chatRoomId: chatRoom.id
    };
    this.chatService
      .joinChatRoom(joinChatRoom)
      .pipe(take(1))
      .subscribe(
        (response: JoinChatRoomResponse) => {
          // add to open
          const addRequest: AddOpenChatStore = {
            tab: {
              tabId: uuidv4(),
              type: ChatType.ROOM,
              data: response.chatRoom
            }
          };
          this.store$.dispatch(
            new ChatStoreActions.AddOpenChatStoreAction(addRequest)
          );
          // add to menu
          const request: AddUserChatRoomStore = {
            chatRoom: response.chatRoom
          };
          this.store$.dispatch(
            new ChatStoreActions.AddUserChatRoomStoreAction(request)
          );
          this.close();
        },
        (err) => {
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
      this.chatService
        .getChatRooms(getChatRoomsRequest)
        .pipe(
          take(1),
          finalize(() => {
            this.loadingChatRooms = false;
          })
        )
        .subscribe((response: GetChatRoomsResponse) => {
          this.chatRooms = response.chatRooms;
          this.chatRoomsPagination = response.pagination;
        });
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
