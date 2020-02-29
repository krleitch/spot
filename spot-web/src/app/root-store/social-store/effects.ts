import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { NotificationsService } from '@services/notifications.service';
import * as featureActions from './actions';
import { GetNotificationsSuccess, AddNotificationSuccess, SetNotificationSeenSuccess,
          DeleteNotificationSuccess, DeleteAllNotificationsSuccess, SetAllNotificationsSeenSuccess } from '@models/notifications';


@Injectable()
export class SocialStoreEffects {
  constructor(private actions$: Actions, private notificationsService: NotificationsService) { }

  @Effect({dispatch: false})
  GenericFailureEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.GenericFailureAction>(
      featureActions.ActionTypes.GENERIC_FAILURE
    ),
    tap((action: featureActions.GenericFailureAction) => {
      this.notificationsService.failureMessage(action.error);
    })
  );

  @Effect()
  getNotificationsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.GetNotificationsAction>(
      featureActions.ActionTypes.GET_NOTIFICATIONS_REQUEST
    ),
    switchMap(action =>
      this.notificationsService
        .getNotifications(action.request)
        .pipe(
          map((response: GetNotificationsSuccess) => {
            return new featureActions.GetNotificationsSuccessAction( response );
          }),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );


  @Effect()
  addNotificationEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.AddNotificationAction>(
      featureActions.ActionTypes.ADD_NOTIFICATION_REQUEST
    ),
    switchMap((post: featureActions.AddNotificationAction) =>
      this.notificationsService
        .addNotification(post.request)
        .pipe(
          map( (response: AddNotificationSuccess) => {
            // TODO this success message to STRINGS
            this.notificationsService.successMessage('Notification Sent!');
            return new featureActions.AddNotificationSuccessAction( response )
          }),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  deleteNotificationEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteNotificationAction>(
      featureActions.ActionTypes.DELETE_NOTIFICATION_REQUEST
    ),
    switchMap((action: featureActions.DeleteNotificationAction) =>
      this.notificationsService
        .deleteNotification(action.request)
        .pipe(
          map( (response: DeleteNotificationSuccess) => {
            return new featureActions.DeleteNotificationSuccessAction( response )
          }),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  deleteAllNotificationsEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.DeleteAllNotificationsAction>(
      featureActions.ActionTypes.DELETE_ALL_NOTIFICATIONS_REQUEST
    ),
    switchMap((action: featureActions.DeleteAllNotificationsAction) =>
      this.notificationsService
        .deleteAllNotifications(action.request)
        .pipe(
          map( (response: DeleteAllNotificationsSuccess) => {
            return new featureActions.DeleteAllNotificationsSuccessAction( response )
          }),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  setNotificationSeenEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.SetNotificationSeenAction>(
      featureActions.ActionTypes.SET_NOTIFICATION_SEEN_REQUEST
    ),
    switchMap((action: featureActions.SetNotificationSeenAction) =>
      this.notificationsService
        .setNotificationSeen(action.request)
        .pipe(
          map( (response: SetNotificationSeenSuccess) => {
            return new featureActions.SetNotificationSeenSuccessAction( response )
          }),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

  @Effect()
  setAllNotificationsSeenEffect$: Observable<Action> = this.actions$.pipe(
    ofType<featureActions.SetAllNotificationsSeenAction>(
      featureActions.ActionTypes.SET_ALL_NOTIFICATIONS_SEEN_REQUEST
    ),
    switchMap((action: featureActions.SetAllNotificationsSeenAction) =>
      this.notificationsService
        .setAllNotificationsSeen(action.request)
        .pipe(
          map( (response: SetAllNotificationsSeenSuccess) => {
            return new featureActions.SetAllNotificationsSeenSuccessAction( response )
          }),
          catchError(errorResponse =>
            observableOf(new featureActions.GenericFailureAction( errorResponse.error ))
          )
        )
    )
  );

}
