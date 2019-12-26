import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getComments(postId: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/comments/${postId}`);
  }

  deleteComment(commentId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/comments/${commentId}`);
  }

  addComment(postId: any, comment: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/comments/${postId}/add`, comment);
  }

}
