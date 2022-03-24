import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ChatStoreEffects } from './effects';
import { featureReducer } from './reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('chat', featureReducer),
    EffectsModule.forFeature([ChatStoreEffects])
  ],
  providers: [ChatStoreEffects]
})
export class ChatStoreModule {}
