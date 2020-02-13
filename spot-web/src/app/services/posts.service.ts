import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

import { DeletePostRequest, DeletePostSuccess, AddPostRequest, AddPostSuccess, LoadPostSuccess, LikePostSuccess,
          LikePostRequest, DislikePostRequest, DislikePostSuccess, LoadPostRequest,
          LoadSinglePostRequest, LoadSinglePostSuccess } from '@models/posts';
import { AlertService } from '@services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private alertService: AlertService) { }

  getPosts(request: LoadPostRequest): Observable<LoadPostSuccess> {
    let params = new HttpParams();
    params = params.append('latitude', request.location.latitude.toString());
    params = params.append('longitude', request.location.longitude.toString());
    params = params.append('location', request.filter.location);
    params = params.append('sort', request.filter.sort);
    params = params.append('offset', request.offset.toString());
    params = params.append('limit', request.limit.toString());
    return this.http.get<LoadPostSuccess>(`${this.baseUrl}/posts`, { params });
  }

  getPost(request: LoadSinglePostRequest): Observable<LoadSinglePostSuccess> {
    return this.http.get<LoadSinglePostSuccess>(`${this.baseUrl}/posts/${request.postId}`);
  }

  addPost(request: AddPostRequest): Observable<AddPostSuccess> {
    return this.http.post<AddPostSuccess>(`${this.baseUrl}/posts`, request);
  }

  deletePost(request: DeletePostRequest): Observable<DeletePostSuccess> {
    return this.http.delete<DeletePostSuccess>(`${this.baseUrl}/posts/${request.postId}`);
  }

  likePost(request: LikePostRequest): Observable<LikePostSuccess> {
    return this.http.put<LikePostSuccess>(`${this.baseUrl}/posts/${request.postId}/like`, request);
  }

  dislikePost(request: DislikePostRequest): Observable<DislikePostSuccess> {
    return this.http.put<DislikePostSuccess>(`${this.baseUrl}/posts/${request.postId}/dislike`, request);
  }

  failureMessage(message: string) {
    this.alertService.error(message);
  }

}
