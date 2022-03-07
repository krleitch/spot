import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

// env
import { environment } from 'src/environments/environment';

// models
import {
  AcceptFriendRequest,
  AcceptFriendResponse,
  CreateFriendRequest,
  CreateFriendResponse,
  DeclineFriendRequest,
  DeclineFriendResponse,
  DeleteFriendRequest,
  DeleteFriendResponse,
  DeletePendingFriendRequest,
  DeletePendingFriendResponse,
  GetFriendRequestsRequest,
  GetFriendRequestsResponse,
  GetFriendsRequest,
  GetFriendsResponse,
  GetPendingFriendsRequest,
  GetPendingFriendsResponse
} from '@models/../newModels/friend';

@Injectable({
  providedIn: 'root'
})
export class FriendService {
  constructor(private http: HttpClient) {}

  baseUrl = environment.baseUrl;

  // friends
  getFriends(request: GetFriendsRequest): Observable<GetFriendsResponse> {
    let params = new HttpParams();
    if (request.after) {
      params = params.append('after', request.after);
    }
    if (request.before) {
      params = params.append('before', request.before);
    }
    params = params.append(
      'limit',
      request.limit ? request.limit.toString() : null
    );
    return this.http.get<GetFriendsResponse>(`${this.baseUrl}/friend`, {
      params
    });
  }

  deleteFriend(request: DeleteFriendRequest): Observable<DeleteFriendResponse> {
    return this.http.delete<DeleteFriendResponse>(
      `${this.baseUrl}/friend/${request.friendId}`
    );
  }

  // friend requests
  getFriendRequests(
    request: GetFriendRequestsRequest
  ): Observable<GetFriendRequestsResponse> {
    return this.http.get<GetFriendRequestsResponse>(
      `${this.baseUrl}/friend/requests`
    );
  }

  createFriend(request: CreateFriendRequest): Observable<CreateFriendResponse> {
    return this.http.post<CreateFriendResponse>(
      `${this.baseUrl}/friend/requests`,
      request
    );
  }

  acceptFriendRequest(
    request: AcceptFriendRequest
  ): Observable<AcceptFriendResponse> {
    return this.http.post<AcceptFriendResponse>(
      `${this.baseUrl}/friend/requests/accept`,
      request
    );
  }

  declineFriendRequest(
    request: DeclineFriendRequest
  ): Observable<DeclineFriendResponse> {
    return this.http.post<DeclineFriendResponse>(
      `${this.baseUrl}/friend/requests/decline`,
      request
    );
  }

  // pending
  getPendingFriends(
    request: GetPendingFriendsRequest
  ): Observable<GetPendingFriendsResponse> {
    return this.http.get<GetPendingFriendsResponse>(
      `${this.baseUrl}/friend/pending`
    );
  }

  deletePendingFriend(
    request: DeletePendingFriendRequest
  ): Observable<DeletePendingFriendResponse> {
    return this.http.delete<DeletePendingFriendResponse>(
      `${this.baseUrl}/friend/pending/${request.friendId}`
    );
  }
}
