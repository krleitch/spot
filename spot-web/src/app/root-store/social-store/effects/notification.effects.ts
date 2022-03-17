import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as notificationsActions from '../actions/notification.actions';

// Services
import { NotificationService } from '@src/app/services/notification.service';

// Models
import {
  DeleteAllNotificationsResponse,
  DeleteNotificationResponse,
  GetNotificationsResponse,
  GetUnseenNotificationsResponse,
  SetAllNotificationsSeenResponse,
  SetNotificationSeenResponse
} from '@models/notification';
import { SpotError } from '@exceptions/error';

@Injectable()
export class SocialStoreEffects {
  constructor(
    private actions$: Actions,
    private notificationService: NotificationService
  ) {}

  GenericFailureEffect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType<notificationsActions.GenericFailureAction>(
          notificationsActions.NotificationsActionTypes.GENERIC_FAILURE
        ),
        tap((action) => {
          this.notificationService.failureMessage(action.error.message);
        })
      ),
    { dispatch: false }
  );

  getNotificationsEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<notificationsActions.GetNotificationsAction>(
        notificationsActions.NotificationsActionTypes.GET_NOTIFICATIONS_REQUEST
      ),
      switchMap((action) =>
        this.notificationService.getNotifications(action.request).pipe(
          map((response: GetNotificationsResponse) => {
            return new notificationsActions.GetNotificationsSuccessAction({
              response: response,
              initialLoad: !action.request.before && !action.request.after
            });
          }),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new notificationsActions.GetNotificationsFailureAction(
                errorResponse.error
              )
            )
          )
        )
      )
    )
  );

  deleteNotificationEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<notificationsActions.DeleteNotificationAction>(
        notificationsActions.NotificationsActionTypes
          .DELETE_NOTIFICATION_REQUEST
      ),
      switchMap((action: notificationsActions.DeleteNotificationAction) =>
        this.notificationService.deleteNotification(action.request).pipe(
          map((response: DeleteNotificationResponse) => {
            return new notificationsActions.DeleteNotificationSuccessAction({
              response: response,
              notificationId: action.request.notificationId
            });
          }),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new notificationsActions.GenericFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  deleteAllNotificationsEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<notificationsActions.DeleteAllNotificationsAction>(
        notificationsActions.NotificationsActionTypes
          .DELETE_ALL_NOTIFICATIONS_REQUEST
      ),
      switchMap((action) =>
        this.notificationService.deleteAllNotifications(action.request).pipe(
          map((response: DeleteAllNotificationsResponse) => {
            return new notificationsActions.DeleteAllNotificationsSuccessAction(
              response
            );
          }),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new notificationsActions.GenericFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  setNotificationSeenEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<notificationsActions.SetNotificationSeenAction>(
        notificationsActions.NotificationsActionTypes
          .SET_NOTIFICATION_SEEN_REQUEST
      ),
      switchMap((action) =>
        this.notificationService.setNotificationSeen(action.request).pipe(
          map((response: SetNotificationSeenResponse) => {
            return new notificationsActions.SetNotificationSeenSuccessAction({
              response: response,
              notificationId: action.request.notificationId
            });
          }),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new notificationsActions.GenericFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  setAllNotificationsSeenEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<notificationsActions.SetAllNotificationsSeenAction>(
        notificationsActions.NotificationsActionTypes
          .SET_ALL_NOTIFICATIONS_SEEN_REQUEST
      ),
      switchMap((action) =>
        this.notificationService.setAllNotificationsSeen(action.request).pipe(
          map((response: SetAllNotificationsSeenResponse) => {
            return new notificationsActions.SetAllNotificationsSeenSuccessAction(
              response
            );
          }),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new notificationsActions.GenericFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );

  getUnseenNotificationsEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType<notificationsActions.GetUnseenNotificationsAction>(
        notificationsActions.NotificationsActionTypes
          .GET_UNSEEN_NOTIFICATIONS_REQUEST
      ),
      switchMap((action) =>
        this.notificationService.getUnseenNotifications(action.request).pipe(
          map((response: GetUnseenNotificationsResponse) => {
            return new notificationsActions.GetUnseenNotificationsSuccessAction(
              response
            );
          }),
          catchError((errorResponse: { error: SpotError }) =>
            observableOf(
              new notificationsActions.GenericFailureAction(errorResponse.error)
            )
          )
        )
      )
    )
  );
}
