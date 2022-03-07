import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

// Models
import {
  GetCommentActivityRequest,
  GetCommentActivityResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  CreateReplyRequest,
  CreateReplyResponse,
  DeleteCommentRequest,
  DeleteCommentResponse,
  DeleteReplyRequest,
  DeleteReplyResponse,
  RateCommentRequest,
  RateCommentResponse,
  GetCommentsRequest,
  GetCommentsResponse,
  GetRepliesRequest,
  GetRepliesResponse,
  RateReplyRequest,
  RateReplyResponse,
  ReportCommentRequest,
  ReportCommentResponse
} from '@models/../newModels/comment';

// Services
import { AlertService } from '@services/alert.service';

// Assets
import { environment } from 'src/environments/environment';
import { COMMENT_CONSTANTS } from '@constants/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private alertService: AlertService) {}

  getComments(request: GetCommentsRequest): Observable<GetCommentsResponse> {
    let params = new HttpParams();
    if (request.after) {
      params = params.append('after', request.after);
    }
    if (request.before) {
      params = params.append('before', request.before);
    }
    if (request.commentLink) {
      params = params.append('commentLink', request.commentLink);
    }
    params = params.append('limit', request.limit.toString());
    return this.http.get<GetCommentsResponse>(
      `${this.baseUrl}/comment/${request.spotId}`,
      { params }
    );
  }

  createComment(
    request: CreateCommentRequest
  ): Observable<CreateCommentResponse> {
    const formData = new FormData();
    formData.append('json', JSON.stringify(request));

    if (request.image) {
      formData.append('image', request.image);
    }

    return this.http.post<CreateCommentResponse>(
      `${this.baseUrl}/comment/${request.spotId}`,
      formData
    );
  }

  deleteComment(
    request: DeleteCommentRequest
  ): Observable<DeleteCommentResponse> {
    return this.http.delete<DeleteCommentResponse>(
      `${this.baseUrl}/comment/${request.spotId}/${request.commentId}`
    );
  }

  getReplies(request: GetRepliesRequest): Observable<GetRepliesResponse> {
    let params = new HttpParams();
    if (request.after) {
      params = params.append('after', request.after);
    }
    if (request.before) {
      params = params.append('before', request.before);
    }
    if (request.replyLink) {
      params = params.append('replyLink', request.replyLink);
    }
    params = params.append('limit', request.limit.toString());
    return this.http.get<GetRepliesResponse>(
      `${this.baseUrl}/comment/${request.spotId}/${request.commentId}`,
      { params }
    );
  }

  createReply(request: CreateReplyRequest): Observable<CreateReplyResponse> {
    const formData = new FormData();
    formData.append('json', JSON.stringify(request));

    if (request.image) {
      formData.append('image', request.image);
    }

    return this.http.post<CreateReplyResponse>(
      `${this.baseUrl}/comment/${request.spotId}/${request.commentId}`,
      formData
    );
  }

  deleteReply(request: DeleteReplyRequest): Observable<DeleteReplyResponse> {
    return this.http.delete<DeleteReplyResponse>(
      `${this.baseUrl}/comment/${request.spotId}/${request.commentId}/${request.replyId}`
    );
  }

  rateComment(request: RateCommentRequest): Observable<RateCommentResponse> {
    return this.http.put<RateCommentResponse>(
      `${this.baseUrl}/comment/${request.spotId}/${request.commentId}/${request.rating}`,
      request
    );
  }

  reportComment(
    request: ReportCommentRequest
  ): Observable<ReportCommentResponse> {
    return this.http.put<ReportCommentResponse>(
      `${this.baseUrl}/comment/${request.spotId}/${request.commentId}/report`,
      request
    );
  }

  getCommentActivity(
    request: GetCommentActivityRequest
  ): Observable<GetCommentActivityResponse> {
    let params = new HttpParams();
    if (request.before) {
      params = params.append('before', request.before);
    }
    if (request.after) {
      params = params.append('after', request.after);
    }
    params = params.append('limit', request.limit.toString());
    return this.http.get<GetCommentActivityResponse>(
      `${this.baseUrl}/comment/activity`,
      { params }
    );
  }

  rateReply(request: RateReplyRequest): Observable<RateReplyResponse> {
    return this.http.put<RateReplyResponse>(
      `${this.baseUrl}/comment/${request.spotId}/${request.commentId}/${request.commentId}/${request.rating}`,
      request
    );
  }

  failureMessage(message: string): void {
    this.alertService.error(message);
  }

  getProfilePictureClass(index): string {
    if (index === -1) {
      return 'profile pop';
    }
    // the index should already be in the proper range, but this is just for safety
    return 'profile p' + (index % (COMMENT_CONSTANTS.PROFILE_COLORS_COUNT + 1));
  }

  onReportSuccess(): void {
    this.alertService.success('Your report has been sent');
  }
}
