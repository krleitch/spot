import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { NotificationsService } from '@services/notifications.service';
import * as notificationsActions from '../actions/notifications.actions';
import { GetNotificationsSuccess, AddNotificationSuccess, SetNotificationSeenSuccess,
          DeleteNotificationSuccess, DeleteAllNotificationsSuccess, SetAllNotificationsSeenSuccess,
          GetNotificationsUnreadSuccess } from '@models/notifications';


@Injectable()
export class SocialStoreEffects {
  constructor(private actions$: Actions, private notificationsService: NotificationsService) { }

  @Effect({dispatch: false})
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<notificationsActions.GenericFailureAction>(
      notificationsActions.NotificationsActionTypes.GENERIC_FAILURE
    ),
    tap((action: notificationsActions.GenericFailureAction) => {
      this.notificationsService.failureMessage(action.error.message);
    })
  );

  @Effect()
  getNotificationsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<notificationsActions.GetNotificationsAction>(
      notificationsActions.NotificationsActionTypes.GET_NOTIFICATIONS_REQUEST
    ),
    switchMap(action =>
      this.notificationsService
        .getNotifications(action.request)
        .pipe(
          map((response: GetNotificationsSuccess) => {
            response.date = action.request.date;
            response.initialLoad = action.request.initialLoad;
            return new notificationsActions.GetNotificationsSuccessAction( response );
          }),
          catchError(errorResponse =>
            observableOf(new notificationsActions.GetNotificationsFailureAction( errorResponse.error ))
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
      this.notificationsService
        .deleteNotification(action.request)
        .pipe(
          map( (response: DeleteNotificationSuccess) => {
            return new notificationsActions.DeleteNotificationSuccessAction( response )
          }),
          catchError(errorResponse =>
            observableOf(new notificationsActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  deleteAllNotificationsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<notificationsActions.DeleteAllNotificationsAction>(
      notificationsActions.NotificationsActionTypes.DELETE_ALL_NOTIFICATIONS_REQUEST
    ),
    switchMap((action: notificationsActions.DeleteAllNotificationsAction) =>
      this.notificationsService
        .deleteAllNotifications(action.request)
        .pipe(
          map( (response: DeleteAllNotificationsSuccess) => {
            return new notificationsActions.DeleteAllNotificationsSuccessAction( response )
          }),
          catchError(errorResponse =>
            observableOf(new notificationsActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  setNotificationSeenEffect$: Observable<Action> = this.actions$.pipe(
    ofType<notificationsActions.SetNotificationSeenAction>(
      notificationsActions.NotificationsActionTypes.SET_NOTIFICATION_SEEN_REQUEST
    ),
    switchMap((action: notificationsActions.SetNotificationSeenAction) =>
      this.notificationsService
        .setNotificationSeen(action.request)
        .pipe(
          map( (response: SetNotificationSeenSuccess) => {
            return new notificationsActions.SetNotificationSeenSuccessAction(response);
          }),
          catchError(errorResponse =>
            observableOf(new notificationsActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  setAllNotificationsSeenEffect$: Observable<Action> = this.actions$.pipe(
    ofType<notificationsActions.SetAllNotificationsSeenAction>(
      notificationsActions.NotificationsActionTypes.SET_ALL_NOTIFICATIONS_SEEN_REQUEST
    ),
    switchMap((action: notificationsActions.SetAllNotificationsSeenAction) =>
      this.notificationsService
        .setAllNotificationsSeen(action.request)
        .pipe(
          map( (response: SetAllNotificationsSeenSuccess) => {
            return new notificationsActions.SetAllNotificationsSeenSuccessAction( response )
          }),
          catchError(errorResponse =>
            observableOf(new notificationsActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  getNotificationsUnreadEffect$: Observable<Action> = this.actions$.pipe(
    ofType<notificationsActions.GetNotificationsUnreadAction>(
      notificationsActions.NotificationsActionTypes.GET_NOTIFICATIONS_UNREAD_REQUEST
    ),
    switchMap((action: notificationsActions.GetNotificationsUnreadAction) =>
      this.notificationsService
        .getNotificationsUnread(action.request)
        .pipe(
          map( (response: GetNotificationsUnreadSuccess) => {
            return new notificationsActions.GetNotificationsUnreadSuccessAction( response )
          }),
          catchError(errorResponse =>
            observableOf(new notificationsActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

}
