import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Socket as PhoenixSocket, Channel as PhoenixChannel } from 'phoenix';

import { Observable } from 'rxjs';

// models
import {
  CreateChatRoomRequest,
  CreateChatRoomResponse,
  GetChatRoomsRequest,
  GetChatRoomsResponse,
  GetMessagesRequest,
  GetMessagesResponse
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

  // Requests to Spot-Chat-Server
  getChatRooms(
    _request: GetChatRoomsRequest
  ): Observable<GetChatRoomsResponse> {
    return this.http.get<GetChatRoomsResponse>(`${this.chatBaseUrl}/rooms`);
  }

  getMessages(request: GetMessagesRequest): Observable<GetMessagesResponse> {
    let params = new HttpParams();
    if (request.before) {
      params = params.append('before', request.before);
    }
    return this.http.get<GetMessagesResponse>(
      `${this.chatBaseUrl}/rooms/${request.roomId}/messages`,
      { params }
    );
  }

  createChatRoom(
    request: CreateChatRoomRequest
  ): Observable<CreateChatRoomResponse> {
    return this.http.post<CreateChatRoomResponse>(
      `${this.chatBaseUrl}/rooms`,
      request
    );
  }

  // Channels
  connectToChannel(roomId: string): PhoenixChannel {
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

  // Service functions
  getProfilePictureClass(index): string {
    if (index === -1) {
      return 'profile pop';
    }
    // the index should already be in the proper range, but this is just for safety
    return 'profile p' + index;
  }
}
