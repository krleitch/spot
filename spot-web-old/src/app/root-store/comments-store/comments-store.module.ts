import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CommentsStoreEffects } from './effects';
import { featureReducer } from './reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('comments', featureReducer),
    EffectsModule.forFeature([CommentsStoreEffects])
  ],
  providers: [CommentsStoreEffects]
})
export class CommentsStoreModule {}
