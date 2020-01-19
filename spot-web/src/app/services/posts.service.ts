import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { PostRatingResponse, PostRatingRequest } from '@models/posts';
import { AlertService } from '@services/alert.service';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private alertService: AlertService) { }

  getPosts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/posts`)
    .pipe(map(result => result));
  }

  getPostRating(request: PostRatingRequest): Observable<PostRatingResponse> {
    return this.http.get<PostRatingResponse>(`${this.baseUrl}/posts/${request.postId}/rating`);
  }

  addPost(post: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/posts`, post);
  }

  deletePost(post: any): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/posts/${post.Id}`);
  }

  likePost(request: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/posts/${request.postId}/like`, request);
  }

  dislikePost(request: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/posts/${request.postId}/Dislike`, request);
  }

  failureMessage(message: string) {
    this.alertService.error(message);
  }

}
