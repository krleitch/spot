import { Injectable } from '@angular/core';

// rxjs
import { of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// services
import { ChatService } from '@src/app/services/chat.service';

// store
import * as featureActions from './actions';
import { Actions, createEffect, ofType } from '@ngrx/effects';

@Injectable()
export class ChatStoreEffects {
  constructor(private chatService: ChatService, private actions$: Actions) {}

  GenericFailureEffect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<featureActions.GenericFailureAction>(
          featureActions.ActionTypes.GENERIC_FAILURE
        ),
        tap((_action) => {
          // None
        })
      ),
    { dispatch: false }
  );
}
