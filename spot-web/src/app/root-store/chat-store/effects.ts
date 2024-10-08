import { Injectable } from '@angular/core';

// rxjs
import { of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

// services
import { ChatService } from '@src/app/services/chat.service';

// store
import * as featureActions from './actions';
import { Actions, createEffect, ofType } from '@ngrx/effects';

// models
import { GetChatRoomsResponse, GetUserChatRoomsResponse } from '@models/chat';
import { SpotError } from '@exceptions/error';

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

  getUserChatRoomsEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<featureActions.GetUserChatRoomsRequestAction>(
        featureActions.ActionTypes.GET_USER_CHAT_ROOMS_REQUEST
      ),
      switchMap((action) =>
        this.chatService.getUserChatRooms(action.request).pipe(
          map((response: GetUserChatRoomsResponse) => {
            return new featureActions.GetUserChatRoomsSuccessAction(response);
          }),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new featureActions.GetUserChatRoomsFailureAction(
                errorResponse.error
              )
            )
          )
        )
      )
    )
  );
}
