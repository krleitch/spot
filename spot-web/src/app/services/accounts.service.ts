import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AlertService } from '@services/alert.service';
import { UpdateUsernameRequest, UpdateUsernameResponse, FacebookConnectRequest, FacebookConnectResponse,
          FacebookDisconnectResponse, FacebookDisconnectRequest, GetAccountMetadataRequest, GetAccountMetadataSuccess,
          UpdateAccountMetadataRequest, UpdateAccountMetadataSuccess } from '@models/accounts';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(private http: HttpClient, private router: Router, private alertService: AlertService) { }

  baseUrl = environment.baseUrl;

  // Facebook requests

  connectFacebookAccount(request: FacebookConnectRequest): Observable<FacebookConnectResponse> {
    return this.http.post<FacebookConnectResponse>(`${this.baseUrl}/accounts/facebook`, request);
  }

  disconnectFacebookAccount(request: FacebookDisconnectRequest): Observable<FacebookDisconnectResponse> {
    return this.http.post<FacebookDisconnectResponse>(`${this.baseUrl}/accounts/facebook/disconnect`, request);
  }

  // Normal requets

  deleteAccount(): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/accounts/delete`);
  }

  getAccount(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/accounts/account`);
  }

  updateUsername(request: UpdateUsernameRequest): Observable<UpdateUsernameResponse> {
    return this.http.put<UpdateUsernameResponse>(`${this.baseUrl}/accounts/account`, request);
  }

  getAccountMetadata(request: GetAccountMetadataRequest): Observable<GetAccountMetadataSuccess> {
    return this.http.get<GetAccountMetadataSuccess>(`${this.baseUrl}/accounts/metadata`);
  }

  updateAccountMetadata(request: UpdateAccountMetadataRequest): Observable<UpdateAccountMetadataSuccess> {
    return this.http.put<UpdateAccountMetadataSuccess>(`${this.baseUrl}/accounts/metadata`, request);
  }

  // service functions

  onDeleteAccountSuccess() {
    this.router.navigateByUrl('/');
  }

  failureMessage(message: string) {
    this.alertService.error(message);
  }

  getAccountRedirect() {
    if ( this.router.url === '/' ) {
      this.router.navigateByUrl('/home');
    }
  }

}
