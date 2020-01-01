import { AuthInterceptor } from './helpers/auth.interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RootStoreModule } from './root-store';

import { NavigationComponent } from './components/navigation/navigation.component';
import { AccountComponent } from './components/account/account.component';
import { PostComponent } from './components/post/post.component';
import { CommentsComponent } from './components/comments/comments.component';
import { EditorComponent } from './components/editor/editor.component';

import { LandingComponent } from './components/pre-auth/landing/landing.component';
import { NavComponent } from './components/pre-auth/nav/nav.component';
import { LoginComponent } from './components/pre-auth/login/login.component';
import { RegisterComponent } from './components/pre-auth/register/register.component';
import { AlertComponent } from './components/helpers/alert/alert.component';

import { NavComponent as MainNavComponent } from './components/main/nav/nav.component';
import { HomeComponent } from './components/main/home/home.component';
import { CreateComponent } from './components/main/create/create.component';


@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    AccountComponent,
    PostComponent,
    CommentsComponent,
    EditorComponent,
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
    CreateComponent
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
