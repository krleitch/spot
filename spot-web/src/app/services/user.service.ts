import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

// Services
import { AlertService } from '@services/alert.service';

// Models
import {
  GetUserRequest,
  GetUserResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  FacebookConnectRequest,
  FacebookConnectResponse,
  FacebookDisconnectRequest,
  FacebookDisconnectResponse,
  GoogleConnectRequest,
  GoogleConnectResponse,
  GoogleDisconnectRequest,
  GoogleDisconnectResponse,
  UpdateEmailRequest,
  UpdateEmailResponse,
  UpdatePhoneRequest,
  UpdatePhoneResponse,
  UpdateUsernameRequest,
  UpdateUsernameResponse,
  VerifyConfirmRequest,
  VerifyConfirmResponse,
  VerifyRequest,
  VerifyResponse
} from '@models/user';
import {
  GetUserMetadataRequest,
  GetUserMetadataResponse,
  UpdateUserMetadataRequest,
  UpdateUserMetadataResponse
} from '@models/userMetadata';
import {
  UploadProfilePictureRequest,
  UploadProfilePictureResponse,
  DeleteProfilePictureRequest,
  DeleteProfilePictureResponse,
  UploadChatRoomPhotoRequest,
  UploadChatRoomPhotoResponse,
  DeleteChatRoomPhotoRequest,
  DeleteChatRoomPhotoResponse
} from '@models/image';

// Assets
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private alertService: AlertService
  ) {}

  baseUrl = environment.baseUrl;

  // Facebook requests

  connectFacebookUser(
    request: FacebookConnectRequest
  ): Observable<FacebookConnectResponse> {
    return this.http.post<FacebookConnectResponse>(
      `${this.baseUrl}/user/facebook`,
      request
    );
  }

  disconnectFacebookUser(
    request: FacebookDisconnectRequest
  ): Observable<FacebookDisconnectResponse> {
    return this.http.post<FacebookDisconnectResponse>(
      `${this.baseUrl}/user/facebook/disconnect`,
      request
    );
  }

  // Google requests

  connectGoogleUser(
    request: GoogleConnectRequest
  ): Observable<GoogleConnectResponse> {
    return this.http.post<GoogleConnectResponse>(
      `${this.baseUrl}/user/google`,
      request
    );
  }

  disconnectGoogleUser(
    request: GoogleDisconnectRequest
  ): Observable<GoogleDisconnectResponse> {
    return this.http.post<GoogleDisconnectResponse>(
      `${this.baseUrl}/user/google/disconnect`,
      request
    );
  }

  // Normal requests

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deleteUser(_request: DeleteUserRequest): Observable<DeleteUserResponse> {
    return this.http.delete<DeleteUserResponse>(`${this.baseUrl}/user`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getUser(_request: GetUserRequest): Observable<GetUserResponse> {
    return this.http.get<GetUserResponse>(`${this.baseUrl}/user`);
  }

  updateUsername(
    request: UpdateUsernameRequest
  ): Observable<UpdateUsernameResponse> {
    return this.http.put<UpdateUsernameResponse>(
      `${this.baseUrl}/user/username`,
      request
    );
  }

  updateEmail(request: UpdateEmailRequest): Observable<UpdateEmailResponse> {
    return this.http.put<UpdateEmailResponse>(
      `${this.baseUrl}/user/email`,
      request
    );
  }

  updatePhone(request: UpdatePhoneRequest): Observable<UpdatePhoneResponse> {
    return this.http.put<UpdatePhoneResponse>(
      `${this.baseUrl}/user/phone`,
      request
    );
  }

  getUserMetadata(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _request: GetUserMetadataRequest
  ): Observable<GetUserMetadataResponse> {
    return this.http.get<GetUserMetadataResponse>(
      `${this.baseUrl}/user/metadata`
    );
  }

  updateUserMetadata(
    request: UpdateUserMetadataRequest
  ): Observable<UpdateUserMetadataResponse> {
    return this.http.put<UpdateUserMetadataResponse>(
      `${this.baseUrl}/user/metadata`,
      request
    );
  }

  verifyUser(request: VerifyRequest): Observable<VerifyResponse> {
    return this.http.post<VerifyResponse>(
      `${this.baseUrl}/user/verify`,
      request
    );
  }

  verifyConfirmUser(
    request: VerifyConfirmRequest
  ): Observable<VerifyConfirmResponse> {
    return this.http.post<VerifyConfirmResponse>(
      `${this.baseUrl}/user/verify/confirm`,
      request
    );
  }

  // Profile picture
  uploadProfilePicture(
    request: UploadProfilePictureRequest
  ): Observable<UploadProfilePictureResponse> {
    const formData = new FormData();
    formData.append('json', JSON.stringify(request));

    if (request.image) {
      formData.append('image', request.image);
    }
    return this.http.put<UploadProfilePictureResponse>(
      `${this.baseUrl}/user/upload/profile`,
      formData
    );
  }
  deleteProfilePicture(
    request: DeleteProfilePictureRequest
  ): Observable<DeleteProfilePictureResponse> {
    return this.http.delete<DeleteProfilePictureResponse>(
      `${this.baseUrl}/user/upload/profile`,
      request
    );
  }

  // Chat Room Photo
  uploadChatRoomPhoto(
    request: UploadChatRoomPhotoRequest
  ): Observable<UploadChatRoomPhotoResponse> {
    const formData = new FormData();
    formData.append('json', JSON.stringify(request));

    if (request.image) {
      formData.append('image', request.image);
    }
    return this.http.post<UploadChatRoomPhotoResponse>(
      `${this.baseUrl}/user/upload/chat`,
      formData
    );
  }
  deleteChatRoomPhoto(
    request: DeleteChatRoomPhotoRequest
  ): Observable<DeleteChatRoomPhotoResponse> {
    return this.http.delete<DeleteChatRoomPhotoResponse>(
      `${this.baseUrl}/user/upload/chat`,
      request
    );
  }

  // service functions

  onDeleteUserSuccess(): void {
  }

  failureMessage(message: string): void {
    this.alertService.error(message);
  }

  getUserRedirect(): void {
    if (this.router.url === '/') {
      this.router.navigateByUrl('/home');
    }
  }
}
