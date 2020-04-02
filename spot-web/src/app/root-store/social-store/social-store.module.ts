import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SocialStoreEffects } from './effects/notifications.effects';
import { FriendsEffects } from './effects/friends.effects';
import { featureReducer } from './reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('social', featureReducer),
    EffectsModule.forFeature([SocialStoreEffects, FriendsEffects])
  ],
  providers: [SocialStoreEffects, FriendsEffects]
})
export class SocialStoreModule {}
