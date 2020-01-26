import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { AddCommentRequest, LoadCommentsRequest, LoadCommentsSuccess, AddCommentSuccess, DeleteCommentRequest,
          DeleteCommentSuccess, LoadRepliesRequest, LoadRepliesSuccess, AddReplyRequest, AddReplySuccess,
          DeleteReplyRequest, DeleteReplySuccess, LikeCommentRequest, DislikeCommentRequest,
          LikeCommentSuccess, DislikeCommentSuccess, LikeReplyRequest, DislikeReplyRequest,
          LikeReplySuccess, DislikeReplySuccess } from '@models/comments';
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

  deleteComment(request: DeleteCommentRequest): Observable<DeleteCommentSuccess> {
    return this.http.delete<DeleteCommentSuccess>(`${this.baseUrl}/comments/${request.postId}/${request.commentId}`);
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

  deleteReply(request: DeleteReplyRequest): Observable<DeleteReplySuccess> {
    return this.http.delete<DeleteReplySuccess>(`${this.baseUrl}/comments/${request.postId}/${request.parentId}/${request.commentId}`);
  }

  likeComment(request: LikeCommentRequest): Observable<LikeCommentSuccess> {
    return this.http.put<LikeCommentSuccess>(`${this.baseUrl}/comments/${request.postId}/${request.commentId}/like`, request);
  }

  dislikeComment(request: DislikeCommentRequest): Observable<DislikeCommentSuccess> {
    return this.http.put<DislikeCommentSuccess>(`${this.baseUrl}/comments/${request.postId}/${request.commentId}/dislike`, request);
  }

  likeReply(request: LikeReplyRequest): Observable<LikeReplySuccess> {
    return this.http.put<LikeReplySuccess>
    (`${this.baseUrl}/comments/${request.postId}/${request.parentId}/${request.commentId}/like`, request);
  }

  dislikeReply(request: DislikeReplyRequest): Observable<DislikeReplySuccess> {
    return this.http.put<DislikeReplySuccess>
    (`${this.baseUrl}/comments/${request.postId}/${request.parentId}/${request.commentId}/dislike`, request);
  }

  failureMessage(message: string) {
    this.alertService.error(message);
  }

}
