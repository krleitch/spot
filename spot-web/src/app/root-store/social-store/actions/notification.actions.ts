import { Action } from '@ngrx/store';

// Models
import {
  DeleteAllNotificationsRequest,
  DeleteAllNotificationsResponse,
  DeleteNotificationRequest,
  DeleteNotificationResponse,
  GetNotificationsRequest,
  GetNotificationsResponse,
  GetUnseenNotificationsRequest,
  GetUnseenNotificationsResponse,
  SetAllNotificationsSeenRequest,
  SetAllNotificationsSeenResponse,
  SetNotificationSeenRequest,
  SetNotificationSeenResponse
} from '@models/../newModels/notification';
import { SpotError } from '@exceptions/error';

export enum NotificationsActionTypes {
  GET_NOTIFICATIONS_REQUEST = '[Social] Get Notifications Request',
  GET_NOTIFICATIONS_SUCCESS = '[Social] Get Notifications Success',
  GET_NOTIFICATIONS_FAILURE = '[Social] Get Notifications Failure',
  GET_UNSEEN_NOTIFICATIONS_REQUEST = '[Social] Get Unseen Notifications Request',
  GET_UNSEEN_NOTIFICATIONS_SUCCESS = '[Social] Get Unseen Notifications Success',
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
  constructor(
    public response: {
      response: GetNotificationsResponse;
      initialLoad: boolean;
    }
  ) {}
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
  constructor(
    public response: {
      response: DeleteNotificationResponse;
      notificationId: string;
    }
  ) {}
}

export class DeleteAllNotificationsAction implements Action {
  readonly type = NotificationsActionTypes.DELETE_ALL_NOTIFICATIONS_REQUEST;
  constructor(public request: DeleteAllNotificationsRequest) {}
}

export class DeleteAllNotificationsSuccessAction implements Action {
  readonly type = NotificationsActionTypes.DELETE_ALL_NOTIFICATIONS_SUCCESS;
  constructor(public response: DeleteAllNotificationsResponse) {}
}

export class SetNotificationSeenAction implements Action {
  readonly type = NotificationsActionTypes.SET_NOTIFICATION_SEEN_REQUEST;
  constructor(public request: SetNotificationSeenRequest) {}
}

export class SetNotificationSeenSuccessAction implements Action {
  readonly type = NotificationsActionTypes.SET_NOTIFICATION_SEEN_SUCCESS;
  constructor(
    public response: {
      response: SetNotificationSeenResponse;
      notificationId: string;
    }
  ) {}
}

export class SetAllNotificationsSeenAction implements Action {
  readonly type = NotificationsActionTypes.SET_ALL_NOTIFICATIONS_SEEN_REQUEST;
  constructor(public request: SetAllNotificationsSeenRequest) {}
}

export class SetAllNotificationsSeenSuccessAction implements Action {
  readonly type = NotificationsActionTypes.SET_ALL_NOTIFICATIONS_SEEN_SUCCESS;
  constructor(public response: SetAllNotificationsSeenResponse) {}
}

export class GetUnseenNotificationsAction implements Action {
  readonly type = NotificationsActionTypes.GET_UNSEEN_NOTIFICATIONS_REQUEST;
  constructor(public request: GetUnseenNotificationsRequest) {}
}

export class GetUnseenNotificationsSuccessAction implements Action {
  readonly type = NotificationsActionTypes.GET_UNSEEN_NOTIFICATIONS_SUCCESS;
  constructor(public response: GetUnseenNotificationsResponse) {}
}

export type NotificationsActions =
  | GenericFailureAction
  | GetNotificationsAction
  | GetNotificationsSuccessAction
  | DeleteNotificationAction
  | GetUnseenNotificationsSuccessAction
  | GetNotificationsFailureAction
  | SetNotificationSeenAction
  | SetNotificationSeenSuccessAction
  | DeleteNotificationSuccessAction
  | DeleteAllNotificationsAction
  | DeleteAllNotificationsSuccessAction
  | SetAllNotificationsSeenAction
  | SetAllNotificationsSeenSuccessAction
  | GetUnseenNotificationsAction;
