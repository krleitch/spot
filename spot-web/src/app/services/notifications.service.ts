import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AlertService } from '@services/alert.service';
import { GetNotificationsRequest, GetNotificationsSuccess, AddNotificationRequest, AddNotificationSuccess,
          SetNotificationSeenSuccess, SetNotificationSeenRequest, DeleteAllNotificationsRequest,
          DeleteAllNotificationsSuccess, DeleteNotificationRequest, DeleteNotificationSuccess } from '@models/notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private http: HttpClient, private alertService: AlertService) { }

  baseUrl = environment.baseUrl;

  getNotifications(request: GetNotificationsRequest): Observable<GetNotificationsSuccess> {
    return this.http.get<GetNotificationsSuccess>(`${this.baseUrl}/notifications`);
  }

  addNotification(request: AddNotificationRequest): Observable<AddNotificationSuccess> {
    return this.http.post<AddNotificationSuccess>(`${this.baseUrl}/notifications`, request);
  }

  deleteNotification(request: DeleteNotificationRequest): Observable<DeleteNotificationSuccess> {
    return this.http.delete<DeleteNotificationSuccess>(`${this.baseUrl}/notifications/${request.notificationId}`);
  }

  deleteAllNotifications(request: DeleteAllNotificationsRequest): Observable<DeleteAllNotificationsSuccess> {
    return this.http.delete<DeleteAllNotificationsSuccess>(`${this.baseUrl}/notifications`);
  }

  setNotificationSeen(request: SetNotificationSeenRequest): Observable<SetNotificationSeenSuccess> {
    return this.http.post<SetNotificationSeenSuccess>(`${this.baseUrl}/notifications/${request.notificationId}`, request);
  }

  failureMessage(message: string) {
    this.alertService.error(message);
  }

  successMessage(message: string) {
    this.alertService.success(message);
  }

}
