import { Action } from '@ngrx/store';

// Models
import {
  DeleteAllNotificationsRequest,
  DeleteAllNotificationsSuccess,
  DeleteNotificationRequest,
  DeleteNotificationSuccess,
  GetNotificationsRequest,
  GetNotificationsSuccess,
  GetNotificationsUnreadRequest,
  GetNotificationsUnreadSuccess,
  SetAllNotificationsSeenRequest,
  SetAllNotificationsSeenSuccess,
  SetNotificationSeenRequest,
  SetNotificationSeenSuccess
} from '@models/notifications';
import { SpotError } from '@exceptions/error';

export enum NotificationsActionTypes {
  GET_NOTIFICATIONS_REQUEST = '[Social] Get Notifications Request',
  GET_NOTIFICATIONS_SUCCESS = '[Social] Get Notifications Success',
  GET_NOTIFICATIONS_FAILURE = '[Social] Get Notifications Failure',
  GET_NOTIFICATIONS_UNREAD_REQUEST = '[Social] Get Notifications Unread Request',
  GET_NOTIFICATIONS_UNREAD_SUCCESS = '[Social] Get Notifications Unread Success',
  DELETE_NOTIFICATION_REQUEST = '[Social] Delete Notification Request',
  DELETE_NOTIFICATION_SUCCESS = '[Social] Delete Notification Success',
  DELETE_ALL_NOTIFICATIONS_REQUEST = '[Social] Delete All Notifications Request',
  DELETE_ALL_NOTIFICATIONS_SUCCESS = '[Social] Delete All Notifications Success',
  SET_NOTIFICATION_SEEN_REQUEST = '[Social] Set Notification Seen Request',
  SET_NOTIFICATION_SEEN_SUCCESS = '[Social] Set Notification Seen Success',
  SET_ALL_NOTIFICATIONS_SEEN_REQUEST = '[Social] Set All Notifications Seen Request',
  SET_ALL_NOTIFICATIONS_SEEN_SUCCESS = '[Social] Set All Notifications Seen Success',
  GENERIC_FAILURE = '[Social] Generic Failure'
}

export class GenericFailureAction implements Action {
  readonly type = NotificationsActionTypes.GENERIC_FAILURE;
  constructor(public error: SpotError) {}
}

export class GetNotificationsAction implements Action {
  readonly type = NotificationsActionTypes.GET_NOTIFICATIONS_REQUEST;
  constructor(public request: GetNotificationsRequest) {}
}

export class GetNotificationsSuccessAction implements Action {
  readonly type = NotificationsActionTypes.GET_NOTIFICATIONS_SUCCESS;
  constructor(public response: GetNotificationsSuccess) {}
}

export class GetNotificationsFailureAction implements Action {
  readonly type = NotificationsActionTypes.GET_NOTIFICATIONS_FAILURE;
  constructor(public error: SpotError) {}
}

export class DeleteNotificationAction implements Action {
  readonly type = NotificationsActionTypes.DELETE_NOTIFICATION_REQUEST;
  constructor(public request: DeleteNotificationRequest) {}
}

export class DeleteNotificationSuccessAction implements Action {
  readonly type = NotificationsActionTypes.DELETE_NOTIFICATION_SUCCESS;
  constructor(public response: DeleteNotificationSuccess) {}
}

export class DeleteAllNotificationsAction implements Action {
  readonly type = NotificationsActionTypes.DELETE_ALL_NOTIFICATIONS_REQUEST;
  constructor(public request: DeleteAllNotificationsRequest) {}
}

export class DeleteAllNotificationsSuccessAction implements Action {
  readonly type = NotificationsActionTypes.DELETE_ALL_NOTIFICATIONS_SUCCESS;
  constructor(public response: DeleteAllNotificationsSuccess) {}
}

export class SetNotificationSeenAction implements Action {
  readonly type = NotificationsActionTypes.SET_NOTIFICATION_SEEN_REQUEST;
  constructor(public request: SetNotificationSeenRequest) {}
}

export class SetNotificationSeenSuccessAction implements Action {
  readonly type = NotificationsActionTypes.SET_NOTIFICATION_SEEN_SUCCESS;
  constructor(public response: SetNotificationSeenSuccess) {}
}

export class SetAllNotificationsSeenAction implements Action {
  readonly type = NotificationsActionTypes.SET_ALL_NOTIFICATIONS_SEEN_REQUEST;
  constructor(public request: SetAllNotificationsSeenRequest) {}
}

export class SetAllNotificationsSeenSuccessAction implements Action {
  readonly type = NotificationsActionTypes.SET_ALL_NOTIFICATIONS_SEEN_SUCCESS;
  constructor(public response: SetAllNotificationsSeenSuccess) {}
}

export class GetNotificationsUnreadAction implements Action {
  readonly type = NotificationsActionTypes.GET_NOTIFICATIONS_UNREAD_REQUEST;
  constructor(public request: GetNotificationsUnreadRequest) {}
}

export class GetNotificationsUnreadSuccessAction implements Action {
  readonly type = NotificationsActionTypes.GET_NOTIFICATIONS_UNREAD_SUCCESS;
  constructor(public response: GetNotificationsUnreadSuccess) {}
}

export type NotificationsActions =
  | GenericFailureAction
  | GetNotificationsAction
  | GetNotificationsSuccessAction
  | DeleteNotificationAction
  | GetNotificationsUnreadSuccessAction
  | GetNotificationsFailureAction
  | SetNotificationSeenAction
  | SetNotificationSeenSuccessAction
  | DeleteNotificationSuccessAction
  | DeleteAllNotificationsAction
  | DeleteAllNotificationsSuccessAction
  | SetAllNotificationsSeenAction
  | SetAllNotificationsSeenSuccessAction
  | GetNotificationsUnreadAction;
