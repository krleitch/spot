import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

// env
import { environment } from 'src/environments/environment';

// models
import { GetFriendsRequest, GetFriendsSuccess, DeleteFriendsRequest, AddFriendRequest, AddFriendRequestSuccess,
          AcceptFriendRequest, AcceptFriendRequestSuccess, GetFriendRequests, GetFriendRequestsSuccess,
          DeleteFriendsSuccess, DeclineFriendRequest, DeclineFriendRequestSuccess } from '@models/friends';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  constructor(private http: HttpClient) { }

  baseUrl = environment.baseUrl;

  getFriends(request: GetFriendsRequest): Observable<GetFriendsSuccess> {
    let params = new HttpParams();
    params = params.append('date', request.date);
    params = params.append('limit', request.limit ? request.limit.toString() : null);
    return this.http.get<GetFriendsSuccess>(`${this.baseUrl}/friends`, { params });
  }

  deleteFriends(request: DeleteFriendsRequest): Observable<DeleteFriendsSuccess> {
    return this.http.delete<DeleteFriendsSuccess>(`${this.baseUrl}/friends/${request.friendId}`);
  }

  getFriendRequests(request: GetFriendRequests): Observable<GetFriendRequestsSuccess> {
    return this.http.get<GetFriendRequestsSuccess>(`${this.baseUrl}/friends/requests`);
  }

  addFriendRequest(request: AddFriendRequest): Observable<AddFriendRequestSuccess> {
    return this.http.post<AddFriendRequestSuccess>(`${this.baseUrl}/friends/requests`, request);
  }

//   deleteFriendRequests(request: DeleteFriendRequestsRequest): Observable<DeleteFriendRequestsSuccess> {
//     return this.http.delete<DeleteFriendRequestsSuccess>(`${this.baseUrl}/friends/requests/${request.friendRequestId}`);
//   }

  acceptFriendRequests(request: AcceptFriendRequest): Observable<AcceptFriendRequestSuccess> {
    return this.http.post<AcceptFriendRequestSuccess>(`${this.baseUrl}/friends/requests/accept`, request);
  }

  declineFriendRequests(request: DeclineFriendRequest): Observable<DeclineFriendRequestSuccess> {
    return this.http.post<DeclineFriendRequestSuccess>(`${this.baseUrl}/friends/requests/decline`, request);
  }

}
