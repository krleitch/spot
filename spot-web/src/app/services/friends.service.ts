import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AlertService } from '@services/alert.service';
import { GetFriendRequestsRequest, GetFriendRequestsSuccess, AddFriendRequestsRequest, 
            AddFriendRequestsSuccess, DeleteFriendRequestsRequest, DeleteFriendRequestsSuccess } from '@models/friends';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  constructor(private http: HttpClient, private alertService: AlertService) { }

  baseUrl = environment.baseUrl;

  getFriendRequests(request: GetFriendRequestsRequest): Observable<GetFriendRequestsSuccess> {
    return this.http.get<GetFriendRequestsSuccess>(`${this.baseUrl}/friends/requests`);
  }

  addFriendRequests(request: AddFriendRequestsRequest): Observable<AddFriendRequestsSuccess> {
    return this.http.post<AddFriendRequestsSuccess>(`${this.baseUrl}/friends/requests`, request);
  }

  deleteFriendRequests(request: DeleteFriendRequestsRequest): Observable<DeleteFriendRequestsSuccess> {
    return this.http.delete<DeleteFriendRequestsSuccess>(`${this.baseUrl}/friends/requests/${request.friendRequestId}`);
  }

  failureMessage(message: string) {
    this.alertService.error(message);
  }

  successMessage(message: string) {
    this.alertService.success(message);
  }

}
