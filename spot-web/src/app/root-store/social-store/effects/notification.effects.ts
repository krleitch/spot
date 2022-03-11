import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { NotificationService } from '@src/app/services/notification.service';
import * as notificationsActions from '../actions/notification.actions';
import {
  DeleteAllNotificationsResponse,
  DeleteNotificationResponse,
  GetNotificationsResponse,
  GetUnseenNotificationsResponse,
  SetAllNotificationsSeenResponse,
  SetNotificationSeenResponse
} from '@models/notification';

@Injectable()
export class SocialStoreEffects {
  constructor(
    private actions$: Actions,
    private notificationService: NotificationService
  ) {}

  @Effect({ dispatch: false })
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<notificationsActions.GenericFailureAction>(
      notificationsActions.NotificationsActionTypes.GENERIC_FAILURE
    ),
    tap((action: notificationsActions.GenericFailureAction) => {
      this.notificationService.failureMessage(action.error.message);
    })
  );

  @Effect()
  getNotificationsEffect$: Observable<Action> = this.actions$.pipe(
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
        catchError((errorResponse) =>
          observableOf(
            new notificationsActions.GetNotificationsFailureAction(
              errorResponse.error
            )
          )
        )
      )
    )
  );

  @Effect()
  deleteNotificationEffect$: Observable<Action> = this.actions$.pipe(
    ofType<notificationsActions.DeleteNotificationAction>(
      notificationsActions.NotificationsActionTypes.DELETE_NOTIFICATION_REQUEST
    ),
    switchMap((action: notificationsActions.DeleteNotificationAction) =>
      this.notificationService.deleteNotification(action.request).pipe(
        map((response: DeleteNotificationResponse) => {
          return new notificationsActions.DeleteNotificationSuccessAction({
            response: response,
            notificationId: action.request.notificationId
          });
        }),
        catchError((errorResponse) =>
          observableOf(
            new notificationsActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  deleteAllNotificationsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<notificationsActions.DeleteAllNotificationsAction>(
      notificationsActions.NotificationsActionTypes
        .DELETE_ALL_NOTIFICATIONS_REQUEST
    ),
    switchMap((action: notificationsActions.DeleteAllNotificationsAction) =>
      this.notificationService.deleteAllNotifications(action.request).pipe(
        map((response: DeleteAllNotificationsResponse) => {
          return new notificationsActions.DeleteAllNotificationsSuccessAction(
            response
          );
        }),
        catchError((errorResponse) =>
          observableOf(
            new notificationsActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  setNotificationSeenEffect$: Observable<Action> = this.actions$.pipe(
    ofType<notificationsActions.SetNotificationSeenAction>(
      notificationsActions.NotificationsActionTypes
        .SET_NOTIFICATION_SEEN_REQUEST
    ),
    switchMap((action: notificationsActions.SetNotificationSeenAction) =>
      this.notificationService.setNotificationSeen(action.request).pipe(
        map((response: SetNotificationSeenResponse) => {
          return new notificationsActions.SetNotificationSeenSuccessAction({
            response: response,
            notificationId: action.request.notificationId
          });
        }),
        catchError((errorResponse) =>
          observableOf(
            new notificationsActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  setAllNotificationsSeenEffect$: Observable<Action> = this.actions$.pipe(
    ofType<notificationsActions.SetAllNotificationsSeenAction>(
      notificationsActions.NotificationsActionTypes
        .SET_ALL_NOTIFICATIONS_SEEN_REQUEST
    ),
    switchMap((action: notificationsActions.SetAllNotificationsSeenAction) =>
      this.notificationService.setAllNotificationsSeen(action.request).pipe(
        map((response: SetAllNotificationsSeenResponse) => {
          return new notificationsActions.SetAllNotificationsSeenSuccessAction(
            response
          );
        }),
        catchError((errorResponse) =>
          observableOf(
            new notificationsActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );

  @Effect()
  getUnseenNotificationsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<notificationsActions.GetUnseenNotificationsAction>(
      notificationsActions.NotificationsActionTypes
        .GET_UNSEEN_NOTIFICATIONS_REQUEST
    ),
    switchMap((action: notificationsActions.GetUnseenNotificationsAction) =>
      this.notificationService.getUnseenNotifications(action.request).pipe(
        map((response: GetUnseenNotificationsResponse) => {
          return new notificationsActions.GetUnseenNotificationsSuccessAction(
            response
          );
        }),
        catchError((errorResponse) =>
          observableOf(
            new notificationsActions.GenericFailureAction(errorResponse.error)
          )
        )
      )
    )
  );
}
