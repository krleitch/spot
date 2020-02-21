import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SocialStoreEffects } from './effects';
import { featureReducer } from './reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('social', featureReducer),
    EffectsModule.forFeature([SocialStoreEffects])
  ],
  providers: [SocialStoreEffects]
})
export class SocialStoreModule {}
