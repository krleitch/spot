import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CommentStoreEffects } from './effects';
import { featureReducer } from './reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('comment', featureReducer),
    EffectsModule.forFeature([CommentStoreEffects])
  ],
  providers: [CommentStoreEffects]
})
export class CommentStoreModule {}
