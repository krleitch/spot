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

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private baseUrl = environment.baseUrl;

  // profilePictures = [ 'α', 'β', 'γ', 'δ', 'Δ', 'Σ', 'ε', 'ζ', 'η', 'θ', 'Λ', 'λ',
  //                     'μ', 'Ξ', 'π', 'Π', 'ρ', 'Σ', 'μ', 'β', 'Φ', 'φ	', 'Γ', 'Ψ', 'Ω', 'ω'];
  PICTURES_LENGTH = 59;
  COLORS_LENGTH = 14;

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

    const myRequest = { ...request };

    if ( myRequest.image ) {
      const formData = new FormData();
      formData.append('image', myRequest.image);

      return this.http.post<any>(`${this.baseUrl}/image/upload`, formData).pipe(switchMap( response => {
        myRequest.image = response.imageSrc;
        return this.http.post<AddCommentSuccess>(`${this.baseUrl}/comments/${myRequest.postId}/add`, myRequest);
      }));

    } else {
      myRequest.image = null;
      return this.http.post<AddCommentSuccess>(`${this.baseUrl}/comments/${myRequest.postId}/add`, myRequest);
    }

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

    const myRequest = { ...request };

    if ( myRequest.image ) {
      const formData = new FormData();
      formData.append('image', myRequest.image);

      return this.http.post<any>(`${this.baseUrl}/image/upload`, formData).pipe(switchMap( response => {
        myRequest.image = response.imageSrc;
        return this.http.post<AddReplySuccess>(`${this.baseUrl}/comments/${myRequest.postId}/${myRequest.commentId}/add`, myRequest);
      }));

    } else {
      myRequest.image = null;
      return this.http.post<AddReplySuccess>(`${this.baseUrl}/comments/${myRequest.postId}/${myRequest.commentId}/add`, myRequest);
    }

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
    return 'profile p' + (index % this.COLORS_LENGTH);
  }

  getProfilePictureSymbol(index) {
    if ( index === -1 ) {
      return 'op';
    }
    return index % this.PICTURES_LENGTH;
  }

  onReportSuccess() {
    this.alertService.success('Report sent');
  }

}
