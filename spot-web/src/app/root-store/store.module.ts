import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SpotStoreModule } from './spot-store';
import { UserStoreModule } from './user-store';
import { CommentsStoreModule } from './comments-store/comments-store.module';
import { SocialStoreModule } from './social-store/social-store.module';

@NgModule({
  imports: [
    CommonModule,
    SpotStoreModule,
    UserStoreModule,
    CommentsStoreModule,
    SocialStoreModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([])
  ],
  declarations: []
})
export class RootStoreModule {}
