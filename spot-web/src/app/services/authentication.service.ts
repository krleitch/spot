import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Md5 } from 'ts-md5';

// rxjs
import { Observable, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';

// Assets
import { environment } from 'src/environments/environment';
import {
  FacebookLoginRequest,
  FacebookLoginResponse,
  GoogleLoginRequest,
  GoogleLoginResponse,
  NewPasswordRequest,
  NewPasswordResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ValidateTokenRequest,
  ValidateTokenResponse
} from '@models/authentication';
import { AUTHENTICATION_CONSTANTS } from '@constants/authentication';
import { ModalOptions } from '@models/modal';

// Services
import { AlertService } from '@services/alert.service';
import { ModalService } from '@services/modal.service';

interface FacebookResponse {
  status: string;
  authResponse: {accessToken: string };
};
type SocialServiceTypes = 'FB' | 'google' | 'twttr';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  baseUrl = environment.baseUrl;
  googleProviderId = environment.googleProviderId;

  socialServiceReady = new ReplaySubject<SocialServiceTypes>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertService: AlertService,
    private modalService: ModalService,
    private zone: NgZone
  ) {}

  // Facebook
  loginFacebookUser(
    request: FacebookLoginRequest
  ): Observable<FacebookLoginResponse> {
    return this.http.post<FacebookLoginResponse>(
      `${this.baseUrl}/authentication/login/facebook`,
      request
    );
  }

  // Google
  loginGoogleUser(
    request: GoogleLoginRequest
  ): Observable<GoogleLoginResponse> {
    return this.http.post<GoogleLoginResponse>(
      `${this.baseUrl}/authentication/login/google`,
      request
    );
  }

  // Normal auth
  registerUser(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.baseUrl}/authentication/register`,
      request
    );
  }

  loginUser(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}/authentication/login`,
      request
    );
  }

  passwordReset(
    request: PasswordResetRequest
  ): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(
      `${this.baseUrl}/authentication/password-reset`,
      request
    );
  }

  validateToken(
    request: ValidateTokenRequest
  ): Observable<ValidateTokenResponse> {
    return this.http.post<ValidateTokenResponse>(
      `${this.baseUrl}/authentication/new-password/validate`,
      request
    );
  }

  newPassword(request: NewPasswordRequest): Observable<NewPasswordResponse> {
    return this.http.post<NewPasswordResponse>(
      `${this.baseUrl}/authentication/new-password`,
      request
    );
  }

  registerUserSuccess(response: LoginResponse): void {
    this.addIdToken(response.jwt);
    // TODO, this just chgecks global modal, should check auth modal
    if (this.modalService.isOpen('global')) {
      this.modalService.close('global');
      // TODO: refresh the page so u get the updated content form being logged in
    } else {
      this.zone.run(() => {
        this.router.navigateByUrl('/home');
      });
    }
    const modalOptions: ModalOptions = { width: 600, disableClose: true };
    this.modalService.open('global', 'welcome', undefined, modalOptions);
  }

  loginUserSuccess(response: LoginResponse): void {
    this.addIdToken(response.jwt);
    if (this.modalService.isOpen('global')) {
      this.modalService.close('global');
    } else {
      this.zone.run(() => {
        this.router.navigateByUrl('/home');
      });
    }
  }

  // Facebook
  getFacebookAccessToken(): string {
    window['FB'].getLoginStatus(
      (statusResponse: FacebookResponse) => {
        if (statusResponse.status !== 'connected') {
          window['FB'].login(
            (loginResponse: FacebookResponse) => {
              if (loginResponse.status === 'connected') {
                return loginResponse.authResponse.accessToken;
              }
            }
          );
        } else {
          // already logged in
          return statusResponse.authResponse.accessToken;
        }
      }
    );
    return null;
  }

  loginFacebookUserSuccess(response: FacebookLoginResponse): void {
    this.addIdToken(response.jwt);
    if (this.modalService.isOpen('global')) {
      this.modalService.close('global');
    }
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

  loginGoogleUserSuccess(response: GoogleLoginResponse): void {
    this.addIdToken(response.jwt);
    if (this.modalService.isOpen('global')) {
      this.modalService.close('global');
    }
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

  logoutUserSuccess(): void {
    this.removeIdToken();

    // Logout of facebook
    if (window['FB']) {
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

  private addIdToken(jwt: { token: string; expiresIn: number }): void {
    // expiresIn is # of days
    const expiresDate = new Date();
    expiresDate.setHours(expiresDate.getHours() + jwt.expiresIn * 24);

    localStorage.setItem('id_token', jwt.token);
    localStorage.setItem('id_expires_at', expiresDate.toString());
  }

  private removeIdToken(): void {
    localStorage.removeItem('id_token');
    localStorage.removeItem('id_expires_at');
  }

  failureMessage(message: string): void {
    this.alertService.error(message);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('id_token');
    const expiresAt = localStorage.getItem('id_expires_at');

    if (!token || !expiresAt) {
      return false;
    }

    // If token has expired
    if (new Date().getTime() > new Date(expiresAt).getTime()) {
      this.removeIdToken();
      return false;
    }

    return true;
  }

  // used to trigger events in the DOM when social services are connected so they can be async
  sendSocialServiceReady(service: SocialServiceTypes): void {
    this.socialServiceReady.next(service);
  }
}
