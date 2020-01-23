import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { AddCommentRequest, LoadCommentsRequest, LoadCommentsSuccess } from '@models/comments';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getComments(request: LoadCommentsRequest): Observable<LoadCommentsSuccess> {
    return this.http.get<LoadCommentsSuccess>(`${this.baseUrl}/comments/${request.postId}`);
  }

  deleteComment(commentId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/comments/${commentId}`);
  }

  addComment(request: AddCommentRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/comments/${request.postId}/add`, request.content);
  }

}
