import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

// rxjs
import { Observable } from 'rxjs';

// environment
import { environment } from '@src/environments/environment';

// services
import { AlertService } from '@services/alert.service';

// assets
import {
  CreateNotificationRequest,
  CreateNotificationResponse,
  DeleteAllNotificationsRequest,
  DeleteAllNotificationsResponse,
  DeleteNotificationRequest,
  DeleteNotificationResponse,
  GetNotificationsRequest,
  GetNotificationsResponse,
  GetUnseenNotificationsRequest,
  GetUnseenNotificationsResponse,
  SetAllNotificationsSeenRequest,
  SetAllNotificationsSeenResponse,
  SetNotificationSeenRequest,
  SetNotificationSeenResponse
} from '@models/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private http: HttpClient, private alertService: AlertService) {}

  baseUrl = environment.baseUrl;

  getNotifications(
    request: GetNotificationsRequest
  ): Observable<GetNotificationsResponse> {
    let params = new HttpParams();
    if (request.after) {
      params = params.append('after', request.after);
    }
    if (request.before) {
      params = params.append('before', request.before);
    }
    params = params.append('limit', request.limit.toString());
    return this.http.get<GetNotificationsResponse>(
      `${this.baseUrl}/notification`,
      { params }
    );
  }

  createTagNotification(
    request: CreateNotificationRequest
  ): Observable<CreateNotificationResponse> {
    return this.http.post<CreateNotificationResponse>(
      `${this.baseUrl}/notification`,
      request
    );
  }

  deleteNotification(
    request: DeleteNotificationRequest
  ): Observable<DeleteNotificationResponse> {
    return this.http.delete<DeleteNotificationResponse>(
      `${this.baseUrl}/notification/${request.notificationId}`
    );
  }

  deleteAllNotifications(
    request: DeleteAllNotificationsRequest
  ): Observable<DeleteAllNotificationsResponse> {
    return this.http.delete<DeleteAllNotificationsResponse>(
      `${this.baseUrl}/notification`
    );
  }

  setNotificationSeen(
    request: SetNotificationSeenRequest
  ): Observable<SetNotificationSeenResponse> {
    return this.http.put<SetNotificationSeenResponse>(
      `${this.baseUrl}/notification/${request.notificationId}/seen`,
      request
    );
  }

  setAllNotificationsSeen(
    request: SetAllNotificationsSeenRequest
  ): Observable<SetAllNotificationsSeenResponse> {
    return this.http.put<SetAllNotificationsSeenResponse>(
      `${this.baseUrl}/notification/seen`,
      request
    );
  }

  getUnseenNotifications(
    request: GetUnseenNotificationsRequest
  ): Observable<GetUnseenNotificationsResponse> {
    return this.http.get<GetUnseenNotificationsResponse>(
      `${this.baseUrl}/notification/unseen`,
      request
    );
  }

  failureMessage(message: string) {
    this.alertService.error(message);
  }

  successMessage(message: string) {
    this.alertService.success(message);
  }
}
