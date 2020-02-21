import { Action } from '@ngrx/store';

import { GetNotificationsRequest, GetNotificationsSuccess, AddNotificationRequest, AddNotificationSuccess,
          DeleteNotificationRequest, DeleteNotificationSuccess } from '@models/notifications';

export enum ActionTypes {
  GET_NOTIFICATIONS_REQUEST = '[Social] Get Notifications Request',
  GET_NOTIFICATIONS_SUCCESS = '[Social] Get Notifications Success',
  ADD_NOTIFICATION_REQUEST = '[Social] Add Notification Request',
  ADD_NOTIFICATION_SUCCESS = '[Social] Add Notification Success',
  DELETE_NOTIFICATION_REQUEST = '[Social] Delete Notification Request',
  DELETE_NOTIFICATION_SUCCESS = '[Social] Delete Notification Success',
  GENERIC_FAILURE = '[Social] Generic Failure'
}

export class GenericFailureAction implements Action {
  readonly type = ActionTypes.GENERIC_FAILURE;
  constructor(public error: string) {}
}

export class GetNotificationsAction implements Action {
  readonly type = ActionTypes.GET_NOTIFICATIONS_REQUEST;
  constructor(public request: GetNotificationsRequest) {}
}

export class GetNotificationsSuccessAction implements Action {
  readonly type = ActionTypes.GET_NOTIFICATIONS_SUCCESS;
  constructor(public response: GetNotificationsSuccess) {}
}

export class AddNotificationAction implements Action {
  readonly type = ActionTypes.ADD_NOTIFICATION_REQUEST;
  constructor(public request: AddNotificationRequest) {}
}

export class AddNotificationSuccessAction implements Action {
  readonly type = ActionTypes.ADD_NOTIFICATION_SUCCESS;
  constructor(public response: AddNotificationSuccess) {}
}

export class DeleteNotificationAction implements Action {
  readonly type = ActionTypes.DELETE_NOTIFICATION_REQUEST;
  constructor(public request: DeleteNotificationRequest) {}
}

export class DeleteNotificationSuccessAction implements Action {
  readonly type = ActionTypes.DELETE_NOTIFICATION_SUCCESS;
  constructor(public response: DeleteNotificationSuccess) {}
}

export type Actions = GenericFailureAction | GetNotificationsAction | GetNotificationsSuccessAction |
                      AddNotificationAction | AddNotificationSuccessAction | DeleteNotificationAction |
                      DeleteNotificationSuccessAction;

