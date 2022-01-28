import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

// rxjs
import { Observable } from 'rxjs';

// environment
import { environment } from 'src/environments/environment';

// services
import { AlertService } from '@services/alert.service';

// assets
import {
  AddNotificationRequest,
  AddNotificationSuccess,
  DeleteAllNotificationsRequest,
  DeleteAllNotificationsSuccess,
  DeleteNotificationRequest,
  DeleteNotificationSuccess,
  GetNotificationsRequest,
  GetNotificationsSuccess,
  GetNotificationsUnreadRequest,
  GetNotificationsUnreadSuccess,
  SetAllNotificationsSeenRequest,
  SetAllNotificationsSeenSuccess,
  SetNotificationSeenRequest,
  SetNotificationSeenSuccess
} from '@models/notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor(private http: HttpClient, private alertService: AlertService) {}

  baseUrl = environment.baseUrl;

  getNotifications(
    request: GetNotificationsRequest
  ): Observable<GetNotificationsSuccess> {
    let params = new HttpParams();
    if (request.after) {
      params = params.append('after', request.after);
    }
    if (request.before) {
      params = params.append('before', request.before);
    }
    params = params.append('limit', request.limit.toString());
    return this.http.get<GetNotificationsSuccess>(
      `${this.baseUrl}/notifications`,
      { params }
    );
  }

  addNotification(
    request: AddNotificationRequest
  ): Observable<AddNotificationSuccess> {
    return this.http.post<AddNotificationSuccess>(
      `${this.baseUrl}/notifications`,
      request
    );
  }

  deleteNotification(
    request: DeleteNotificationRequest
  ): Observable<DeleteNotificationSuccess> {
    return this.http.delete<DeleteNotificationSuccess>(
      `${this.baseUrl}/notifications/${request.notificationId}`
    );
  }

  deleteAllNotifications(
    request: DeleteAllNotificationsRequest
  ): Observable<DeleteAllNotificationsSuccess> {
    return this.http.delete<DeleteAllNotificationsSuccess>(
      `${this.baseUrl}/notifications`
    );
  }

  setNotificationSeen(
    request: SetNotificationSeenRequest
  ): Observable<SetNotificationSeenSuccess> {
    return this.http.put<SetNotificationSeenSuccess>(
      `${this.baseUrl}/notifications/${request.notificationId}/seen`,
      request
    );
  }

  setAllNotificationsSeen(
    request: SetAllNotificationsSeenRequest
  ): Observable<SetAllNotificationsSeenSuccess> {
    return this.http.put<SetAllNotificationsSeenSuccess>(
      `${this.baseUrl}/notifications/seen`,
      request
    );
  }

  getNotificationsUnread(
    request: GetNotificationsUnreadRequest
  ): Observable<GetNotificationsUnreadSuccess> {
    return this.http.get<GetNotificationsUnreadSuccess>(
      `${this.baseUrl}/notifications/unread`,
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
