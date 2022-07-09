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
  GetMessagesResponse,
  JoinChatRoomRequest,
  JoinChatRoomResponse,
  GetUserChatRoomsRequest,
  GetUserChatRoomsResponse,
  LeaveChatRoomRequest,
  LeaveChatRoomResponse,
  GetFriendMessagesRequest,
  GetFriendMessagesResponse
} from '@models/chat';

// env
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatBaseUrl = environment.chatBaseUrl;
  private websocketUrl = environment.websocketUrl;
  phoenixSocket: PhoenixSocket;

  WEBSOCKET_SERVER_URI = `${this.websocketUrl}/socket`;

  constructor(private http: HttpClient) {}

  connectToWebSocket() {
    // Connect to socket
    this.phoenixSocket = new PhoenixSocket(this.WEBSOCKET_SERVER_URI, {
      params: {
        token: localStorage.getItem('id_token'),
        logger: (kind, msg, data) => {
          console.log(`${kind}: ${msg}`, data);
        }
      }
    });
    this.phoenixSocket.connect();
  }

  disconnectFromWebSocket() {
    if (this.phoenixSocket) {
      this.phoenixSocket.disconnect();
    }
  }

  // Requests to Spot-Chat-Server
  getChatRooms(request: GetChatRoomsRequest): Observable<GetChatRoomsResponse> {
    let params = new HttpParams();
    params = params.append('lat', request.lat);
    params = params.append('lng', request.lng);
    if (request.after) {
      params = params.append('after', request.after);
    }
    return this.http.get<GetChatRoomsResponse>(`${this.chatBaseUrl}/rooms`, {
      params
    });
  }

  getUserChatRooms(
    request: GetUserChatRoomsRequest
  ): Observable<GetUserChatRoomsResponse> {
    let params = new HttpParams();
    params = params.append('lat', request.lat);
    params = params.append('lng', request.lng);
    return this.http.get<GetUserChatRoomsResponse>(
      `${this.chatBaseUrl}/rooms/user`,
      {
        params
      }
    );
  }

  joinChatRoom(request: JoinChatRoomRequest): Observable<JoinChatRoomResponse> {
    return this.http.post<JoinChatRoomResponse>(
      `${this.chatBaseUrl}/rooms/${request.chatRoomId}/join`,
      request
    );
  }

  leaveChatRoom(
    request: LeaveChatRoomRequest
  ): Observable<LeaveChatRoomResponse> {
    return this.http.post<LeaveChatRoomResponse>(
      `${this.chatBaseUrl}/rooms/${request.chatRoomId}/leave`,
      request
    );
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

  getFriendMessages(request: GetFriendMessagesRequest): Observable<GetFriendMessagesResponse> {
    let params = new HttpParams();
    if (request.before) {
      params = params.append('before', request.before);
    }
    return this.http.get<GetFriendMessagesResponse>(
      `${this.chatBaseUrl}/friends/${request.roomId}/messages`,
      { params }
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

  connectToFriendChannel(roomId: string): PhoenixChannel {
    if (!this.phoenixSocket) {
      return;
    }
    const channel = this.phoenixSocket.channel(`chat_friend:${roomId}`, {
      token: localStorage.getItem('id_token')
    });
    return channel;
  }

  disconnectFromChannel(channel: PhoenixChannel) {
    if (channel) {
      channel.leave();
    }
  }
}
