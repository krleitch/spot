import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';

import { AppRoutingModule } from './app-routing.module.tns';
import { AppComponent } from './app.component';

import { RootStoreModule } from './root-store';
import { AccountComponent } from './components/main/account/account.component';
import { CommentsComponent } from './components/comments/comments.component';
import { CreateComponent } from './components/main/create/create.component';
import { LandingComponent } from './components/pre-auth/landing/landing.component';
import { NavComponent } from './components/pre-auth/nav/nav.component';
import { LoginComponent } from './components/pre-auth/login/login.component';
import { RegisterComponent } from './components/pre-auth/register/register.component';
import { AlertComponent } from './components/helpers/alert/alert.component';
import { NavComponent as MainNavComponent } from './components/main/nav/nav.component';
import { ReplyComponent } from './components/main/comments/reply/reply.component';
import { CommentComponent } from './components/main/comments/comment/comment.component';
import { InfiniteScrollComponent } from './components/helpers/infinite-scroll/infinite-scroll.component';
import { PostDetailComponent } from './components/main/post-detail/post-detail.component';
import { ShareComponent } from './components/main/social/share/share.component';
import { NotificationsComponent } from './components/main/social/notifications/notifications.component';
import { NotificationItemComponent } from './components/main/social/notification-item/notification-item.component';

// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from 'nativescript-angular/forms';

// Uncomment and add to NgModule imports  if you need to use the HTTP wrapper
// import { NativeScriptHttpClientModule } from 'nativescript-angular/http-client';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AccountComponent,
    CommentsComponent,
    CreateComponent,
    LandingComponent,
    NavComponent,
    AlertComponent,
    MainNavComponent,
    ReplyComponent,
    CommentComponent,
    InfiniteScrollComponent,
    PostDetailComponent,
    ShareComponent,
    NotificationsComponent,
    NotificationItemComponent
  ],
  imports: [
    NativeScriptModule,
    AppRoutingModule,
    RootStoreModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule { }
