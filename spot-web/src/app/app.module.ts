import { AuthInterceptor } from './helpers/auth.interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { RootStoreModule } from './root-store';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { AccountComponent } from './components/account/account.component';
import { PostComponent } from './components/post/post.component';
import { CommentsComponent } from './components/comments/comments.component';
import { CreateComponent } from './components/create/create.component';
import { EditorComponent } from './components/editor/editor.component';
import { RepliesComponent } from './components/replies/replies.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    NavigationComponent,
    AccountComponent,
    PostComponent,
    CommentsComponent,
    CreateComponent,
    EditorComponent,
    RepliesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RootStoreModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [ { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } ],
  bootstrap: [AppComponent]
})
export class AppModule { }
