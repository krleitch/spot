import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';

import { LandingComponent } from './components/pre-auth/landing/landing.component';
import { LoginComponent } from './components/pre-auth/login/login.component';
import { RegisterComponent } from './components/pre-auth/register/register.component';
import { UsernameComponent } from './components/pre-auth/username/username.component';

import { HomeComponent } from './components/main/home/home.component';
import { AccountComponent } from './components/main/account/account.component';
import { PostDetailComponent } from './components/main/post-detail/post-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'account',
    component: AccountComponent
  },
  {
    path: 'posts/:postId',
    component: PostDetailComponent
  },
  {
    path: 'username',
    component: UsernameComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

