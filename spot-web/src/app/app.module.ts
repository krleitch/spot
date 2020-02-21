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
    NotificationItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RootStoreModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [ { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } ],
  bootstrap: [AppComponent]
})
export class AppModule { }
