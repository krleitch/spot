import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AlertService } from '@services/alert.service';
import { } from '@models/friends';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {

  constructor(private http: HttpClient, private alertService: AlertService) { }

  baseUrl = environment.baseUrl;

//   getNotifications(request: GetNotificationsRequest): Observable<GetNotificationsSuccess> {
//     let params = new HttpParams();
//     params = params.append('offset', request.offset.toString());
//     params = params.append('limit', request.limit.toString());
//     return this.http.get<GetNotificationsSuccess>(`${this.baseUrl}/notifications`, { params });
//   }

  failureMessage(message: string) {
    this.alertService.error(message);
  }

  successMessage(message: string) {
    this.alertService.success(message);
  }

}
