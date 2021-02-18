import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

// env
import { environment } from 'src/environments/environment';

// models
import { GetFriendsRequest, GetFriendsSuccess, DeleteFriendsRequest, AddFriendRequest, AddFriendRequestSuccess,
          AcceptFriendRequest, AcceptFriendRequestSuccess, GetFriendRequests, GetFriendRequestsSuccess,
          DeleteFriendsSuccess, DeclineFriendRequest, DeclineFriendRequestSuccess,
          GetPendingFriendRequests, GetPendingFriendRequestsSuccess,  DeletePendingFriendRequest,
          DeletePendingFriendSuccess } from '@models/friends';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  constructor(private http: HttpClient) { }

  baseUrl = environment.baseUrl;

  // friends
  getFriends(request: GetFriendsRequest): Observable<GetFriendsSuccess> {
    let params = new HttpParams();
    params = params.append('date', request.date);
    params = params.append('limit', request.limit ? request.limit.toString() : null);
    return this.http.get<GetFriendsSuccess>(`${this.baseUrl}/friends`, { params });
  }

  deleteFriends(request: DeleteFriendsRequest): Observable<DeleteFriendsSuccess> {
    return this.http.delete<DeleteFriendsSuccess>(`${this.baseUrl}/friends/${request.friendId}`);
  }

  // friend requests
  getFriendRequests(request: GetFriendRequests): Observable<GetFriendRequestsSuccess> {
    return this.http.get<GetFriendRequestsSuccess>(`${this.baseUrl}/friends/requests`);
  }

  addFriendRequest(request: AddFriendRequest): Observable<AddFriendRequestSuccess> {
    return this.http.post<AddFriendRequestSuccess>(`${this.baseUrl}/friends/requests`, request);
  }

  acceptFriendRequests(request: AcceptFriendRequest): Observable<AcceptFriendRequestSuccess> {
    return this.http.post<AcceptFriendRequestSuccess>(`${this.baseUrl}/friends/requests/accept`, request);
  }

  declineFriendRequests(request: DeclineFriendRequest): Observable<DeclineFriendRequestSuccess> {
    return this.http.post<DeclineFriendRequestSuccess>(`${this.baseUrl}/friends/requests/decline`, request);
  }

  // pending
  getPendingFriendRequests(request: GetPendingFriendRequests): Observable<GetPendingFriendRequestsSuccess> {
    return this.http.get<GetPendingFriendRequestsSuccess>(`${this.baseUrl}/friends/pending`);
  }

  deletePendingFriendRequest(request: DeletePendingFriendRequest): Observable<DeletePendingFriendSuccess> {
    return this.http.delete<DeletePendingFriendSuccess>(`${this.baseUrl}/friends/pending/${request.friendRequestId}`);
  }

}
