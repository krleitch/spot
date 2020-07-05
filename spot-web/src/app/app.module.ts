import { AuthInterceptor } from './helpers/auth.interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RootStoreModule } from './root-store';

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
import { UsernameComponent } from './components/pre-auth/username/username.component';
import { AboutComponent } from './components/pre-auth/about/about.component';
import { ContactComponent } from './components/pre-auth/contact/contact.component';
import { FriendsComponent } from './components/main/social/friends/friends.component';
import { ActivityComponent } from './components/main/activity/activity.component';
import { ReportComponent } from './components/main/social/report/report.component';
import { ModalComponent } from './components/helpers/modal/modal.component';
import { PasswordResetComponent } from './components/pre-auth/password-reset/password-reset.component';
import { NewPasswordComponent } from './components/pre-auth/new-password/new-password.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TagComponent } from './components/main/social/tag/tag.component';
import { SpinnerComponent } from './components/helpers/spinner/spinner.component';
import { ConfirmComponent } from './components/helpers/confirm/confirm.component';
import { AuthModalComponent } from './components/pre-auth/auth-modal/auth-modal.component';
import { VerifyComponent } from './components/main/verify/verify.component';


@NgModule({
  declarations: [
    AppComponent,
    // PRE-AUTH
    LandingComponent,
    LoginComponent,
    RegisterComponent,
    NavComponent,
    // HELPERS
    AlertComponent,
    // MAIN
    MainNavComponent,
    HomeComponent,
    CreateComponent,
    PostComponent,
    AccountComponent,
    // COMMENTS
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
    VerifyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RootStoreModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    StoreModule.forRoot({}, {}),
    EffectsModule.forRoot([])
  ],
  providers: [ { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } ],
  bootstrap: [AppComponent]
})
export class AppModule { }
