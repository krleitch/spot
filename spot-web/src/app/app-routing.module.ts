import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';

import { LandingComponent } from './components/pre-auth/landing/landing.component';
import { LoginComponent } from './components/pre-auth/login/login.component';
import { RegisterComponent } from './components/pre-auth/register/register.component';
import { ContactComponent } from './components/pre-auth/contact/contact.component';
import { AboutComponent } from './components/pre-auth/about/about.component';
import { PasswordResetComponent } from './components/pre-auth/password-reset/password-reset.component';
import { NewPasswordComponent } from './components/pre-auth/new-password/new-password.component';

import { HomeComponent } from './components/main/home/home.component';
import { AccountComponent } from './components/main/account/account.component';
import { PostDetailComponent } from './components/main/post-detail/post-detail.component';
import { FriendsComponent } from './components/main/social/friends/friends.component';
import { ActivityComponent } from './components/main/activity/activity.component';
import { VerifyComponent } from './components/main/verify/verify.component';
import { UsernameComponent } from './components/main/username/username.component';

import { AuthGuardService as AuthGuard } from '@src/app/helpers/auth-guard.service';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent
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
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'friends',
    component: FriendsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'activity',
    component: ActivityComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'verify/:token',
    component: VerifyComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'username',
    component: UsernameComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'posts/:postId',
    component: PostDetailComponent
  },
  {
    path: 'posts/:postId/comments/:commentId',
    component: PostDetailComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'password-reset',
    component: PasswordResetComponent
  },
  {
    path: 'new-password',
    component: NewPasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

