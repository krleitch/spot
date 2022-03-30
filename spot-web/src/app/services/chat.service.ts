import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket as PhoenixSocket } from 'phoenix';

import { Observable } from 'rxjs';

// models
import {
  CreateChatRoomRequest,
  GetChatRoomsRequest,
  GetChatRoomsResponse
} from '@models/chat';

// env
import { environment } from 'src/environments/environment';

export const WEBSOCKET_SERVER_URI = 'ws://localhost:4000/socket';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatBaseUrl = environment.chatBaseUrl;
  phoenixSocket: PhoenixSocket;

  constructor(private http: HttpClient) {
    // Connect to socket
    this.phoenixSocket = new PhoenixSocket(WEBSOCKET_SERVER_URI, {
      params: {
        token: localStorage.getItem('id_token'),
        logger: (kind, msg, data) => {
          console.log(`${kind}: ${msg}`, data);
        }
      }
    });
    this.phoenixSocket.connect();
  }

  // getSession(token: string): any {
  //   return this.http.post<any>(`${this.chatBaseUrl}/sessions`, {
  //     token: token
  //   });
  // }

  // Requests to Spot-Chat-Server
  getChatRooms(
    _request: GetChatRoomsRequest
  ): Observable<GetChatRoomsResponse> {
    return this.http.get<GetChatRoomsResponse>(`${this.chatBaseUrl}/rooms`);
  }

  createChatRoom(request: CreateChatRoomRequest) {
    return this.http.post<any>(`${this.chatBaseUrl}/rooms`, request);
  }

  connectToChannel(roomId: string): any {
    if (!this.phoenixSocket) {
      return;
    }
    const channel = this.phoenixSocket.channel(`chat_room:${roomId}`, {
      token: localStorage.getItem('id_token')
    });
    return channel;
  }

  disconnectFromChannel(channel) {
    if (channel) {
      channel.leave();
    }
  }

  getProfilePictureClass(index): string {
    // if ( index === -1 ) {
    return 'profile pop';
    // }
    // the index should already be in the proper range, but this is just for safety
    // return 'profile p' + (index % (COMMENT_CONSTANTS.PROFILE_COLORS_COUNT + 1));
  }
}
