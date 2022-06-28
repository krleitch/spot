import { Input, Component, OnInit, OnDestroy } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { v4 as uuidv4 } from 'uuid';

// Store
import { select, Store } from '@ngrx/store';
import { RootStoreState } from '@store';
import { UserStoreSelectors } from '@store/user-store';
import { ChatStoreActions } from '@store/chat-store';

// services
import { TranslateService } from '@ngx-translate/core';
import { ChatService } from '@services/chat.service';

// models
import {
  AddOpenChatStore,
  AddUserChatRoomStore,
  ChatRoom,
  ChatTab,
  ChatType,
  JoinChatRoomRequest,
  JoinChatRoomResponse
} from '@models/chat';
import { UserMetadata, UnitSystem } from '@models/userMetadata';
import { LocationData } from '@models/location';

@Component({
  selector: 'spot-chat-join',
  templateUrl: './chat-join.component.html',
  styleUrls: ['./chat-join.component.scss']
})
export class ChatJoinComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  @Input() chatRoom: ChatRoom;

  // location
  location$: Observable<LocationData>;
  location: LocationData;
  errorMessage = '';

  STRINGS: Record<string, string>;

  constructor(
    private store$: Store<RootStoreState.State>,
    private chatService: ChatService,
    private translateService: TranslateService
  ) {
    this.translateService
      .get('MAIN.CHAT_JOIN')
      .subscribe((res: Record<string, string>) => {
        this.STRINGS = res;
      });
  }

  // User Metadata
  userMetadata$: Observable<UserMetadata>;
  userMetadata: UserMetadata;

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
      });
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }

  /**
   * @param distance - miles from the chat location
   * @returns formatted string with location in metric or imperial
   */
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

  // The room cannot be private
  // It can still be full if more users entered since the data was fetched
  joinChatRoom(): void {
    const joinChatRoom: JoinChatRoomRequest = {
      lat: this.location.latitude,
      lng: this.location.longitude,
      chatRoomId: this.chatRoom.id
    };
    this.chatService
      .joinChatRoom(joinChatRoom)
      .pipe(take(1))
      .subscribe(
        (response: JoinChatRoomResponse): void => {
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
        },
        (err) => {
          if (
            Object.prototype.hasOwnProperty.call(
              err.error.errors,
              'user_id_room_id'
            )
          ) {
            // already joined this room, open it
            this.errorMessage = this.STRINGS.ERROR_JOINED;
            this.createRoomTab(this.chatRoom);
          } else {
            this.errorMessage = this.STRINGS.ERROR;
          }
        }
      );
  }

  createRoomTab(room: ChatRoom) {
    const newChat: ChatRoom = {
      ...room
    };
    const request: AddOpenChatStore = {
      tab: {
        tabId: uuidv4(),
        type: ChatType.ROOM,
        data: newChat
      }
    };
    this.store$.dispatch(new ChatStoreActions.AddOpenChatStoreAction(request));
  }
}
