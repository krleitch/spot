import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Md5 } from 'ts-md5/dist/md5';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { RegisterRequest, RegisterResponse } from '@models/authentication';
import { AlertService } from '@services/alert.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    baseUrl = environment.baseUrl;

    constructor(
        private http: HttpClient,
        private router: Router,
        private alertService: AlertService) {
    }

    registerFacebookAccount(request: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/auth/register/facebook`, request);
    }

    loginFacebookAccount(request: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/auth/login/facebook`, request);
    }

    registerAccount(registerRequest: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, registerRequest);
    }

    loginAccount(loginAccountRequest: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/auth/login`, loginAccountRequest);
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

    loginAccountSuccess(action) {
        localStorage.setItem('id_token', action.response.jwt.token);
        localStorage.setItem('id_expires_in', JSON.stringify(action.response.jwt.expiresIn));
        this.router.navigateByUrl('/home');
    }

    loginFacebookAccountSuccess(action) {
        localStorage.setItem('id_token', action.payload.response.jwt.token);
        localStorage.setItem('id_expires_in', JSON.stringify(action.payload.response.jwt.expiresIn));
        this.router.navigateByUrl('/home');
    }

    registerFacebookAccountSuccess(action) {
        localStorage.setItem('id_token', action.response.idToken);
        localStorage.setItem('id_expires_in', JSON.stringify(action.response.expireIn));
    }

    failureMessage(message: string) {
        this.alertService.error(message);
    }

}