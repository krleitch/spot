import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(private http: HttpClient, private router: Router) { }

  baseUrl = environment.baseUrl;

  deleteAccount(): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/accounts/delete`);
  }

  getAccount(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}/accounts/account`);
  }

  onDeleteAccountSuccess() {
    this.router.navigateByUrl('/');
  }

}
