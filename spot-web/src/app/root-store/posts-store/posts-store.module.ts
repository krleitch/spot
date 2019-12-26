import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { PostsStoreEffects } from './effects';
import { featureReducer } from './reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('posts', featureReducer),
    EffectsModule.forFeature([PostsStoreEffects])
  ],
  providers: [PostsStoreEffects]
})
export class PostsStoreModule {}
