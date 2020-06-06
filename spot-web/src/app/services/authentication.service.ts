import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Md5 } from 'ts-md5/dist/md5';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { RegisterRequest, RegisterResponse, FacebookLoginRequest, FacebookLoginResponse, LoginResponse,
         PasswordResetRequest, PasswordResetSuccess, ValidateTokenRequest, ValidateTokenSuccess,
         NewPasswordRequest, NewPasswordSuccess } from '@models/authentication';
import { AlertService } from '@services/alert.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    baseUrl = environment.baseUrl;

    constructor(
        private http: HttpClient,
        private router: Router,
        private alertService: AlertService) {
    }

    // Facebook

    loginFacebookAccount(request: FacebookLoginRequest): Observable<FacebookLoginResponse> {
        return this.http.post<FacebookLoginResponse>(`${this.baseUrl}/auth/login/facebook`, request);
    }

    // Normal auth

    registerAccount(registerRequest: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, registerRequest);
    }

    loginAccount(loginAccountRequest: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/auth/login`, loginAccountRequest);
    }

    passwordReset(request: PasswordResetRequest): Observable<PasswordResetSuccess> {
        return this.http.post<PasswordResetSuccess>(`${this.baseUrl}/auth/password-reset`, request);
    }

    validateToken(request: ValidateTokenRequest): Observable<ValidateTokenSuccess> {
      return this.http.post<ValidateTokenSuccess>(`${this.baseUrl}/auth/new-password/validate`, request);
    }

    newPassword(request: NewPasswordRequest): Observable<NewPasswordSuccess> {
      return this.http.post<NewPasswordSuccess>(`${this.baseUrl}/auth/new-password`, request);
    }

    validateUsername(username: string): boolean {
        return true;
    }

    validateEmail(email: string): boolean {
        const regex = /^\S+@\S+\.\S+$/;
        return email.match(regex) != null;
    }

    validatePhone(phone: string): boolean {
        const regex = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
        return phone.match(regex) != null;
    }

    md5Hash(data: string): string {
        return Md5.hashStr(data).toString();
    }

    logoutAccountSuccess() {
        localStorage.removeItem('id_token');
        localStorage.removeItem('id_expires_in');

        window['FB'].getLoginStatus((response) => {
            if (response.status === 'connected') {
                window['FB'].logout(() => {
                    localStorage.removeItem('fb_access_token');
                    localStorage.removeItem('fb_expires_in');
                });
            }
        });

        this.router.navigateByUrl('/login');
    }

    loginAccountSuccess(response: LoginResponse) {
        localStorage.setItem('id_token', response.jwt.token);
        localStorage.setItem('id_expires_in', JSON.stringify(response.jwt.expiresIn));
        this.router.navigateByUrl('/home');
    }

    loginFacebookAccountSuccess(response: FacebookLoginResponse) {
        localStorage.setItem('id_token', response.jwt.token);
        localStorage.setItem('id_expires_in', JSON.stringify(response.jwt.expiresIn));
        if (response.created) {
          this.router.navigateByUrl('/username');
        } else {
          this.router.navigateByUrl('/home');
        }
    }

    failureMessage(message: string) {
        this.alertService.error(message);
    }

}
