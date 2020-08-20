import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AccountsStoreEffects } from './effects/effects';
import { FacebookStoreEffects } from './effects/facebook.effects';
import { GoogleStoreEffects } from './effects/google.effects';
import { featureReducer } from './reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('accounts', featureReducer),
    EffectsModule.forFeature([AccountsStoreEffects, FacebookStoreEffects, GoogleStoreEffects])
  ],
  providers: [AccountsStoreEffects, FacebookStoreEffects, GoogleStoreEffects]
})
export class AccountsStoreModule {}
