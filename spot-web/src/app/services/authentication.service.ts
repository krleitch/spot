import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Md5 } from 'ts-md5/dist/md5';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';

import { RegisterRequest, RegisterResponse, FacebookLoginRequest, FacebookLoginResponse, LoginResponse,
         PasswordResetRequest, PasswordResetSuccess, ValidateTokenRequest, ValidateTokenSuccess,
         NewPasswordRequest, NewPasswordSuccess, GoogleLoginRequest, GoogleLoginResponse } from '@models/authentication';
import { AlertService } from '@services/alert.service';
import { ModalService } from '@services/modal.service';
import { AUTHENTICATION_CONSTANTS } from '@constants/authentication';
import { STRINGS } from '@assets/strings/en';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    baseUrl = environment.baseUrl;
    googleProviderId = environment.googleProviderId;

    socialServiceReady = new Subject<string>();

    constructor(
        private http: HttpClient,
        private router: Router,
        private alertService: AlertService,
        private modalService: ModalService,
        private zone: NgZone) {
    }

    // Facebook
    loginFacebookAccount(request: FacebookLoginRequest): Observable<FacebookLoginResponse> {
        return this.http.post<FacebookLoginResponse>(`${this.baseUrl}/auth/login/facebook`, request);
    }

    // Google
    loginGoogleAccount(request: GoogleLoginRequest): Observable<GoogleLoginResponse> {
      return this.http.post<GoogleLoginResponse>(`${this.baseUrl}/auth/login/google`, request);
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

    validateEmail(email: string): boolean {
        const regex = /^\S+@\S+\.\S+$/;
        return email.match(regex) != null;
    }

    validatePhone(phone: string): boolean {
      const regex = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
      return phone.match(regex) != null;
    }

    validateUsername(username: string): string {

      // Check length
      if ( username.length < AUTHENTICATION_CONSTANTS.USERNAME_MIN_LENGTH ||
           username.length > AUTHENTICATION_CONSTANTS.USERNAME_MAX_LENGTH ) {
            return STRINGS.PRE_AUTH.REGISTER.USERNAME_INVALID_LENGTH
            .replace('%MIN%', AUTHENTICATION_CONSTANTS.USERNAME_MIN_LENGTH.toString())
            .replace('%MAX%', AUTHENTICATION_CONSTANTS.USERNAME_MAX_LENGTH.toString());
      }

      // start with alphanumeric_ word with . - ' singular no repetition and not at end
      const PATTERN = /^\w(?:\w*(?:['.-]\w+)?)*$/;

      // Check characters
      if ( username.match(PATTERN) == null ) {
        return STRINGS.PRE_AUTH.REGISTER.USERNAME_INVALID_CHARACTERS;
      }

      return null;

    }

    validatePassword(password: string): string {

      // Check length
      if ( password.length < AUTHENTICATION_CONSTANTS.PASSWORD_MIN_LENGTH ||
           password.length > AUTHENTICATION_CONSTANTS.PASSWORD_MAX_LENGTH ) {
          return STRINGS.PRE_AUTH.REGISTER.PASSWORD_INVALID_LENGTH
            .replace('%MIN%', AUTHENTICATION_CONSTANTS.PASSWORD_MIN_LENGTH.toString())
            .replace('%MAX%', AUTHENTICATION_CONSTANTS.PASSWORD_MAX_LENGTH.toString());
      }

      return null;

    }

    md5Hash(data: string): string {
        return Md5.hashStr(data).toString();
    }

    registerAccountSuccess(response: LoginResponse) {
      this.addIdToken(response.jwt);
      if ( this.modalService.isOpen('spot-auth-modal') ) {
        this.modalService.close('spot-auth-modal');
        // TODO: refresh the page so u get the updated content form being logged in
      } else {
        this.zone.run(() => {
          this.router.navigateByUrl('/home');
        });
      }
      this.modalService.open('spot-welcome-modal');
    }

    loginAccountSuccess(response: LoginResponse) {
      this.addIdToken(response.jwt);
      if ( this.modalService.isOpen('spot-auth-modal') ) {
        this.modalService.close('spot-auth-modal');
        // TODO: refresh the page so u get the updated content form being logged in
      } else {
        this.zone.run(() => {
          this.router.navigateByUrl('/home');
        });
      }
    }

    loginFacebookAccountSuccess(response: FacebookLoginResponse) {
      this.addIdToken(response.jwt);
      if (response.created) {
        this.zone.run(() => {
          this.router.navigateByUrl('/username');
        });
      } else {
        this.zone.run(() => {
          this.router.navigateByUrl('/home');
        });
      }
    }

    loginGoogleAccountSuccess(response: GoogleLoginResponse) {
      this.addIdToken(response.jwt);
      if (response.created) {
        this.zone.run(() => {
          this.router.navigateByUrl('/username');
        });
      } else {
        this.zone.run(() => {
          this.router.navigateByUrl('/home');
        });
      }
    }

    logoutAccountSuccess() {
      this.removeIdToken();

      // Logout of facebook
      if ( window['FB'] ) {
        window['FB'].getLoginStatus((response) => {
          if (response.status === 'connected') {
              window['FB'].logout(() => {
                  localStorage.removeItem('fb_access_token');
                  localStorage.removeItem('fb_expires_in');
              });
          }
        });
      }

      this.zone.run(() => {
        this.router.navigateByUrl('/login');
      });

    }

    private addIdToken(jwt: { token: string, expiresIn: number }) {

      // expiresIn is # of hours

      const expiresDate = new Date();
      expiresDate.setHours(expiresDate.getHours() + jwt.expiresIn);

      localStorage.setItem('id_token', jwt.token);
      localStorage.setItem('id_expires_at', expiresDate.toString());

    }

    private removeIdToken() {
      localStorage.removeItem('id_token');
      localStorage.removeItem('id_expires_at');
    }

    failureMessage(message: string) {
        this.alertService.error(message);
    }

    isAuthenticated(): boolean {

      const token = localStorage.getItem('id_token');
      const expiresAt = localStorage.getItem('id_expires_at');

      if ( !token || !expiresAt ) {
        return false;
      }

      if ( new Date().getTime() > new Date(expiresAt).getTime()) {
        return false;
      }

      return true;

    }

    sendSocialServiceReady(service: string) {
      this.socialServiceReady.next(service);
    }

}
