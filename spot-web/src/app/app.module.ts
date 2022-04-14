import { AuthInterceptor } from './helpers/interceptors/auth.interceptor';
import { ErrorInterceptor } from './helpers/interceptors/error.interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule
} from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ImageCropperModule } from 'ngx-image-cropper';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RootStoreModule } from './root-store';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { LandingComponent } from './components/pre-auth/landing/landing.component';
import { NavComponent } from './components/pre-auth/nav/nav.component';
import { LoginComponent } from './components/pre-auth/login/login.component';
import { RegisterComponent } from './components/pre-auth/register/register.component';
import { AlertComponent } from './components/helpers/alert/alert.component';

import { NavComponent as MainNavComponent } from './components/main/nav/nav.component';
import { HomeComponent } from './components/main/home/home.component';
import { CreateComponent } from './components/main/create/create.component';
import { PostComponent } from './components/main/post/post.component';
import { AccountComponent } from './components/main/account/account.component';
import { CommentsContainerComponent } from './components/main/comments/comments-container/comments-container.component';
import { ReplyComponent } from './components/main/comments/reply/reply.component';
import { CommentComponent } from './components/main/comments/comment/comment.component';
import { InfiniteScrollComponent } from './components/helpers/infinite-scroll/infinite-scroll.component';
import { PostDetailComponent } from './components/main/post-detail/post-detail.component';
import { ShareComponent } from './components/main/social/share/share.component';
import { NotificationsComponent } from './components/main/social/notifications/notifications.component';
import { NotificationItemComponent } from './components/main/social/notification-item/notification-item.component';
import { ImageComponent } from './components/helpers/image/image.component';
import { UsernameComponent } from './components/main/username/username.component';
import { AboutComponent } from './components/pre-auth/about/about.component';
import { ContactComponent } from './components/pre-auth/contact/contact.component';
import { FriendsComponent } from './components/main/social/friends/friends.component';
import { ActivityComponent } from './components/main/activity/activity.component';
import { ReportComponent } from './components/main/social/report/report.component';
import { ModalComponent } from './components/helpers/modal/modal.component';
import { PasswordResetComponent } from './components/pre-auth/password-reset/password-reset.component';
import { NewPasswordComponent } from './components/pre-auth/new-password/new-password.component';
import { TagComponent } from './components/main/social/tag/tag.component';
import { SpinnerComponent } from './components/helpers/spinner/spinner.component';
import { ConfirmComponent } from './components/helpers/confirm/confirm.component';
import { AuthModalComponent } from './components/pre-auth/auth-modal/auth-modal.component';
import { VerifyComponent } from './components/main/verify/verify.component';
import { WelcomeComponent } from './components/main/welcome/welcome.component';
import { FilterPipe } from './helpers/pipes/filter.pipe';
import { TermsComponent } from './components/pre-auth/terms/terms.component';
import { ChatRoomComponent } from './components/main/chat/chat-room/chat-room.component';
import { ChatMenuComponent } from './components/main/chat/chat-menu/chat-menu.component';
import { ChatTabComponent } from './components/main/chat/chat-tab/chat-tab.component';
import { ChatFriendComponent } from './components/main/chat/chat-friend/chat-friend.component';
import { ChatJoinComponent } from './components/main/chat/chat-join/chat-join.component';
import { UploadPhotoComponent } from './components/helpers/upload-photo/upload-photo.component';
import { ChatCreateComponent } from './components/main/chat/chat-create/chat-create.component';
import { AccountEditComponent } from './components/main/account-edit/account-edit.component';
import { ChatDiscoverComponent } from './components/main/chat/chat-discover/chat-discover.component';

// TODO: Seperate Modules and optimize load bundles

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    // PRE-AUTH
    LandingComponent,
    LoginComponent,
    RegisterComponent,
    NavComponent,
    AlertComponent,
    // MAIN
    MainNavComponent,
    HomeComponent,
    CreateComponent,
    PostComponent,
    AccountComponent,
    CommentsContainerComponent,
    ReplyComponent,
    CommentComponent,
    InfiniteScrollComponent,
    PostDetailComponent,
    ShareComponent,
    NotificationsComponent,
    NotificationItemComponent,
    ImageComponent,
    UsernameComponent,
    AboutComponent,
    ContactComponent,
    FriendsComponent,
    ActivityComponent,
    ReportComponent,
    ModalComponent,
    PasswordResetComponent,
    NewPasswordComponent,
    TagComponent,
    SpinnerComponent,
    ConfirmComponent,
    AuthModalComponent,
    VerifyComponent,
    WelcomeComponent,
    FilterPipe,
    TermsComponent,
    ChatRoomComponent,
    ChatMenuComponent,
    ChatTabComponent,
    ChatFriendComponent,
    ChatJoinComponent,
    UploadPhotoComponent,
    ChatCreateComponent,
    AccountEditComponent,
    ChatDiscoverComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RootStoreModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ImageCropperModule,
    StoreModule.forRoot({}, {}),
    EffectsModule.forRoot([]),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      defaultLanguage: 'en'
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
