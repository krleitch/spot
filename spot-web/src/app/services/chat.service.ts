import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket as PhoenixSocket } from 'phoenix';

// env
import { environment } from 'src/environments/environment';

export const WEBSOCKET_SERVER_URI = 'ws://localhost:4000/socket';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private baseUrl = environment.baseUrl;
  phoenixSocket: PhoenixSocket;

  constructor(private http: HttpClient) {
    this.phoenixSocket = new PhoenixSocket(WEBSOCKET_SERVER_URI, {
      params: { token: localStorage.getItem('id_token') },
    });
    this.phoenixSocket.connect();
  }

  getChannel(name: string, token: string): any {
    const channel = this.phoenixSocket.channel(name, {
      token: token,
    });
    return channel;
  }

  getProfilePictureClass(index): string {
    // if ( index === -1 ) {
      return 'profile pop';
    // }
    // the index should already be in the proper range, but this is just for safety
    // return 'profile p' + (index % (COMMENTS_CONSTANTS.PROFILE_COLORS_COUNT + 1));
  }

}
