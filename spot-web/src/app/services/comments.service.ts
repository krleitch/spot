import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { AddCommentRequest, LoadCommentsRequest, LoadCommentsSuccess, AddCommentSuccess, DeleteCommentRequest,
          DeleteCommentSuccess, LoadRepliesRequest, LoadRepliesSuccess, AddReplyRequest, AddReplySuccess,
          DeleteReplyRequest, DeleteReplySuccess, LikeCommentRequest, DislikeCommentRequest,
          LikeCommentSuccess, DislikeCommentSuccess, LikeReplyRequest, DislikeReplyRequest,
          LikeReplySuccess, DislikeReplySuccess, ReportCommentRequest, ReportCommentSuccess,
          ActivityCommentRequest, ActivityCommentSuccess } from '@models/comments';
import { AlertService } from '@services/alert.service';
import { COMMENTS_CONSTANTS } from '@constants/comments';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private alertService: AlertService) { }

  getComments(request: LoadCommentsRequest): Observable<LoadCommentsSuccess> {
    let params = new HttpParams();
    params = params.append('date', request.date);
    if ( request.commentId ) {
      params = params.append('comment', request.commentId);
    }
    params = params.append('type', request.type);
    params = params.append('limit', request.limit.toString());
    return this.http.get<LoadCommentsSuccess>(`${this.baseUrl}/comments/${request.postId}`, { params });
  }

  addComment(request: AddCommentRequest): Observable<AddCommentSuccess> {

    const formData = new FormData();
    formData.append('json', JSON.stringify(request));

    if ( request.image ) {
      formData.append('image', request.image);
    }

    return this.http.post<AddCommentSuccess>(`${this.baseUrl}/comments/${request.postId}`, formData);

  }

  deleteComment(request: DeleteCommentRequest): Observable<DeleteCommentSuccess> {
    return this.http.delete<DeleteCommentSuccess>(`${this.baseUrl}/comments/${request.postId}/${request.commentId}`);
  }

  getReplies(request: LoadRepliesRequest): Observable<LoadRepliesSuccess> {
    let params = new HttpParams();
    if ( request.date ) {
      params = params.append('date', request.date);
    }
    params = params.append('limit', request.limit.toString());
    return this.http.get<LoadRepliesSuccess>(`${this.baseUrl}/comments/${request.postId}/${request.commentId}`, { params });
  }

  addReply(request: AddReplyRequest): Observable<AddReplySuccess> {

    const formData = new FormData();
    formData.append('json', JSON.stringify(request));

    if ( request.image ) {
      formData.append('image', request.image);
    }

    return this.http.post<AddReplySuccess>(`${this.baseUrl}/comments/${request.postId}/${request.commentId}`, formData);

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

  reportComment(request: ReportCommentRequest): Observable<ReportCommentSuccess> {
    return this.http.put<ReportCommentSuccess>(`${this.baseUrl}/comments/${request.postId}/${request.commentId}/report`, request);
  }

  getActivity(request: ActivityCommentRequest): Observable<ActivityCommentSuccess> {
    let params = new HttpParams();
    params = params.append('date', request.date);
    params = params.append('limit', request.limit.toString());
    return this.http.get<ActivityCommentSuccess>(`${this.baseUrl}/comments/activity`, { params });
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

  getProfilePictureClass(index) {
    if ( index === -1 ) {
      return 'profile pop';
    }
    return 'profile p' + (index % (COMMENTS_CONSTANTS.PROFILE_COLORS_COUNT + 1));
  }

  onReportSuccess() {
    this.alertService.success('Report sent');
  }

}
