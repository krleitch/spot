import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SpotStoreModule } from './spot-store';
import { UserStoreModule } from './user-store';
import { CommentStoreModule } from './comment-store/comment-store.module';
import { SocialStoreModule } from './social-store/social-store.module';
import { ChatStoreModule } from './chat-store/chat-store.module';

@NgModule({
  imports: [
    CommonModule,
    SpotStoreModule,
    UserStoreModule,
    CommentStoreModule,
    SocialStoreModule,
    ChatStoreModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([])
  ],
  declarations: []
})
export class RootStoreModule {}
