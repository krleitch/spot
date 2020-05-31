import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AlertService } from '@services/alert.service';
import { GetFriendRequestsRequest, GetFriendRequestsSuccess, AddFriendRequestsRequest,
            AddFriendRequestsSuccess, DeleteFriendRequestsRequest, DeleteFriendRequestsSuccess,
            AcceptFriendRequestsRequest, AcceptFriendRequestsSuccess, DeclineFriendRequestsRequest,
            DeclineFriendRequestsSuccess, GetFriendsRequest, GetFriendsSuccess, DeleteFriendsRequest,
            DeleteFriendsSuccess } from '@models/friends';

import { SpotError } from '@exceptions/error';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  constructor(private http: HttpClient, private alertService: AlertService) { }

  baseUrl = environment.baseUrl;

  getFriends(request: GetFriendsRequest): Observable<GetFriendsSuccess> {
    return this.http.get<GetFriendsSuccess>(`${this.baseUrl}/friends`);
  }

  deleteFriends(request: DeleteFriendsRequest): Observable<DeleteFriendsSuccess> {
    return this.http.delete<DeleteFriendsSuccess>(`${this.baseUrl}/friends/${request.friendId}`);
  }

  getFriendRequests(request: GetFriendRequestsRequest): Observable<GetFriendRequestsSuccess> {
    return this.http.get<GetFriendRequestsSuccess>(`${this.baseUrl}/friends/requests`);
  }

  addFriendRequests(request: AddFriendRequestsRequest): Observable<AddFriendRequestsSuccess> {
    return this.http.post<AddFriendRequestsSuccess>(`${this.baseUrl}/friends/requests`, request);
  }

//   deleteFriendRequests(request: DeleteFriendRequestsRequest): Observable<DeleteFriendRequestsSuccess> {
//     return this.http.delete<DeleteFriendRequestsSuccess>(`${this.baseUrl}/friends/requests/${request.friendRequestId}`);
//   }

  acceptFriendRequests(request: AcceptFriendRequestsRequest): Observable<AcceptFriendRequestsSuccess> {
    return this.http.post<AcceptFriendRequestsSuccess>(`${this.baseUrl}/friends/requests/accept`, request);
  }

  declineFriendRequests(request: DeclineFriendRequestsRequest): Observable<DeclineFriendRequestsSuccess> {
    return this.http.post<DeclineFriendRequestsSuccess>(`${this.baseUrl}/friends/requests/decline`, request);
  }

  failureMessage(error: SpotError) {
    this.alertService.error(error.message);
  }

  successMessage(message: string) {
    this.alertService.success(message);
  }

}
