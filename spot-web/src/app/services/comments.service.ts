import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { AddCommentRequest, LoadCommentsRequest, LoadCommentsSuccess, AddCommentSuccess, DeleteCommentRequest,
          LoadRepliesRequest, LoadRepliesSuccess, AddReplyRequest, AddReplySuccess } from '@models/comments';
import { AlertService } from '@services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private alertService: AlertService) { }

  getComments(request: LoadCommentsRequest): Observable<LoadCommentsSuccess> {
    let params = new HttpParams();
    params = params.append('offset', request.offset.toString());
    params = params.append('limit', request.limit.toString());
    return this.http.get<LoadCommentsSuccess>(`${this.baseUrl}/comments/${request.postId}`, { params });
  }

  addComment(request: AddCommentRequest): Observable<AddCommentSuccess> {
    return this.http.post<AddCommentSuccess>(`${this.baseUrl}/comments/${request.postId}/add`, request);
  }

  deleteComment(request: DeleteCommentRequest): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/comments/${request.postId}/${request.commentId}`);
  }

  getReplies(request: LoadRepliesRequest): Observable<LoadRepliesSuccess> {
    let params = new HttpParams();
    params = params.append('offset', request.offset.toString());
    params = params.append('limit', request.limit.toString());
    return this.http.get<LoadRepliesSuccess>(`${this.baseUrl}/comments/${request.postId}/${request.commentId}`, { params });
  }

  addReply(request: AddReplyRequest): Observable<AddReplySuccess> {
    return this.http.post<AddReplySuccess>(`${this.baseUrl}/comments/${request.postId}/${request.commentId}/add`, request);
  }

  failureMessage(message: string) {
    this.alertService.error(message);
  }

}
