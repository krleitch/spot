import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { DeletePostRequest, DeletePostSuccess, AddPostRequest, AddPostSuccess, LoadPostSuccess, LikePostSuccess,
          LikePostRequest, DislikePostRequest, DislikePostSuccess } from '@models/posts';
import { AlertService } from '@services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private alertService: AlertService) { }

  getPosts(): Observable<LoadPostSuccess> {
    return this.http.get<LoadPostSuccess>(`${this.baseUrl}/posts`);
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
    return this.http.put<DislikePostSuccess>(`${this.baseUrl}/posts/${request.postId}/Dislike`, request);
  }

  failureMessage(message: string) {
    this.alertService.error(message);
  }

}
