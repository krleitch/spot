import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SpotError } from '@exceptions/error';

import { DeletePostRequest, DeletePostSuccess, AddPostRequest, AddPostSuccess, LoadPostSuccess, LikePostSuccess,
          LikePostRequest, DislikePostRequest, DislikePostSuccess, LoadPostRequest,
          LoadSinglePostRequest, LoadSinglePostSuccess, ReportPostRequest, ReportPostSuccess,
          ActivityPostRequest, ActivityPostSuccess, UnratedPostRequest, UnratedPostSuccess } from '@models/posts';
import { AlertService } from '@services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private alertService: AlertService) { }

  getPosts(request: LoadPostRequest): Observable<LoadPostSuccess> {
    let params = new HttpParams();
    if ( request.location ) {
      params = params.append('latitude', request.location.latitude.toString());
      params = params.append('longitude', request.location.longitude.toString());
    }
    params = params.append('location', request.filter.location);
    params = params.append('sort', request.filter.sort);
    params = params.append('offset', request.offset ? request.offset.toString() : null);
    params = params.append('limit', request.limit.toString());
    params = params.append('date', request.date ? request.date : null);
    return this.http.get<LoadPostSuccess>(`${this.baseUrl}/posts`, { params });
  }

  getPost(request: LoadSinglePostRequest): Observable<LoadSinglePostSuccess> {
    let params = new HttpParams();
    if ( request.location ) {
      params = params.append('latitude', request.location.latitude.toString());
      params = params.append('longitude', request.location.longitude.toString());
    }
    return this.http.get<LoadSinglePostSuccess>(`${this.baseUrl}/posts/${request.postLink}`, { params });
  }

  addPost(request: AddPostRequest): Observable<AddPostSuccess> {

    const formData = new FormData();
    formData.append('json', JSON.stringify(request));

    if ( request.image ) {
      formData.append('image', request.image);
    }
    return this.http.post<AddPostSuccess>(`${this.baseUrl}/posts`, formData);

  }

  deletePost(request: DeletePostRequest): Observable<DeletePostSuccess> {
    return this.http.delete<DeletePostSuccess>(`${this.baseUrl}/posts/${request.postId}`);
  }

  reportPost(request: ReportPostRequest): Observable<ReportPostSuccess> {
    return this.http.put<ReportPostSuccess>(`${this.baseUrl}/posts/${request.postId}/report`, request);
  }

  unratedPost(request: UnratedPostRequest): Observable<UnratedPostSuccess> {
    return this.http.put<UnratedPostSuccess>(`${this.baseUrl}/posts/${request.postId}/unrated`, request);
  }

  getActivity(request: ActivityPostRequest): Observable<ActivityPostSuccess> {
    let params = new HttpParams();
    if ( request.before ) {
      params = params.append('before', request.before);
    }
    if ( request.after ) {
      params = params.append('after', request.after);
    }
    params = params.append('limit', request.limit.toString());
    if ( request.location ) {
      params = params.append('latitude', request.location.latitude.toString());
      params = params.append('longitude', request.location.longitude.toString());
    }
    return this.http.get<ActivityPostSuccess>(`${this.baseUrl}/posts/activity`, { params });
  }

  dislikePost(request: DislikePostRequest): Observable<DislikePostSuccess> {
    return this.http.put<DislikePostSuccess>(`${this.baseUrl}/posts/${request.postId}/dislike`, request);
  }


  likePost(request: LikePostRequest): Observable<LikePostSuccess> {
    return this.http.put<LikePostSuccess>(`${this.baseUrl}/posts/${request.postId}/like`, request);
  }

  failureMessage(error: SpotError) {
    this.alertService.error(error.message);
  }

  onReportSuccess() {
    this.alertService.success('Report sent');
  }

}
