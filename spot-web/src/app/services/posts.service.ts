import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
    return this.http.get<LoadSinglePostSuccess>(`${this.baseUrl}/posts/${request.postLink}`);
  }

  addPost(request: AddPostRequest): Observable<AddPostSuccess> {

    if ( request.image ) {
      const formData = new FormData();
      formData.append('image', request.image);

      return this.http.post<any>(`${this.baseUrl}/image/upload`, formData).pipe(switchMap( response => {
        request.image = response.imageSrc;
        return this.http.post<AddPostSuccess>(`${this.baseUrl}/posts`, request);
      }));

    } else {
      request.image = null;
      return this.http.post<AddPostSuccess>(`${this.baseUrl}/posts`, request);
    }
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

  calcDistance(lat1: number, lon1: number, lat2: number, lon2: number, unit: string) {
    if ((lat1 === lat2) && (lon1 === lon2)) {
      return 0;
    } else {
      const radlat1 = Math.PI * lat1 / 180;
      const radlat2 = Math.PI * lat2 / 180;
      const theta = lon1 - lon2;
      const radtheta = Math.PI * theta / 180;
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180/Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit === 'K') { dist = dist * 1.609344; }
      if (unit === 'N') { dist = dist * 0.8684; }
      return dist;
    }
  }

}
