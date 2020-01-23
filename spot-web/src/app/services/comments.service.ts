import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { AddCommentRequest, LoadCommentsRequest, LoadCommentsSuccess, AddCommentSuccess } from '@models/comments';
import { AlertService } from '@services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private alertService: AlertService) { }

  getComments(request: LoadCommentsRequest): Observable<LoadCommentsSuccess> {
    return this.http.get<LoadCommentsSuccess>(`${this.baseUrl}/comments/${request.postId}`);
  }

  addComment(request: AddCommentRequest): Observable<AddCommentSuccess> {
    return this.http.post<AddCommentSuccess>(`${this.baseUrl}/comments/${request.postId}/add`, request);
  }

  deleteComment(commentId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/comments/${commentId}`);
  }

  failureMessage(message: string) {
    this.alertService.error(message);
  }

}
