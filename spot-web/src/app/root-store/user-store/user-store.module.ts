import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { UserStoreEffects } from './effects/effects';
import { FacebookStoreEffects } from './effects/facebook.effects';
import { GoogleStoreEffects } from './effects/google.effects';
import { featureReducer } from './reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('user', featureReducer),
    EffectsModule.forFeature([
      UserStoreEffects,
      FacebookStoreEffects,
      GoogleStoreEffects
    ])
  ],
  providers: [UserStoreEffects, FacebookStoreEffects, GoogleStoreEffects]
})
export class UserStoreModule {}
