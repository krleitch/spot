import { Action } from '@ngrx/store';

import { GetNotificationsRequest, GetNotificationsSuccess, AddNotificationRequest, AddNotificationSuccess,
          DeleteNotificationRequest, DeleteNotificationSuccess, SetNotificationSeenRequest,
          SetNotificationSeenSuccess, DeleteAllNotificationsRequest, DeleteAllNotificationsSuccess,
          SetAllNotificationsSeenRequest, SetAllNotificationsSeenSuccess } from '@models/notifications';

export enum ActionTypes {
  GET_NOTIFICATIONS_REQUEST = '[Social] Get Notifications Request',
  GET_NOTIFICATIONS_SUCCESS = '[Social] Get Notifications Success',
  ADD_NOTIFICATION_REQUEST = '[Social] Add Notification Request',
  ADD_NOTIFICATION_SUCCESS = '[Social] Add Notification Success',
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

export class DeleteAllNotificationsAction implements Action {
  readonly type = ActionTypes.DELETE_ALL_NOTIFICATIONS_REQUEST;
  constructor(public request: DeleteAllNotificationsRequest) {}
}

export class DeleteAllNotificationsSuccessAction implements Action {
  readonly type = ActionTypes.DELETE_ALL_NOTIFICATIONS_SUCCESS;
  constructor(public response: DeleteAllNotificationsSuccess) {}
}

export class SetNotificationSeenAction implements Action {
  readonly type = ActionTypes.SET_NOTIFICATION_SEEN_REQUEST;
  constructor(public request: SetNotificationSeenRequest) {}
}

export class SetNotificationSeenSuccessAction implements Action {
  readonly type = ActionTypes.SET_NOTIFICATION_SEEN_SUCCESS;
  constructor(public response: SetNotificationSeenSuccess) {}
}

export class SetAllNotificationsSeenAction implements Action {
  readonly type = ActionTypes.SET_ALL_NOTIFICATIONS_SEEN_REQUEST;
  constructor(public request: SetAllNotificationsSeenRequest) {}
}

export class SetAllNotificationsSeenSuccessAction implements Action {
  readonly type = ActionTypes.SET_ALL_NOTIFICATIONS_SEEN_SUCCESS;
  constructor(public response: SetAllNotificationsSeenSuccess) {}
}

export type Actions = GenericFailureAction | GetNotificationsAction | GetNotificationsSuccessAction |
                      AddNotificationAction | AddNotificationSuccessAction | DeleteNotificationAction |
                      SetNotificationSeenAction | SetNotificationSeenSuccessAction | DeleteNotificationSuccessAction |
                      DeleteAllNotificationsAction | DeleteAllNotificationsSuccessAction | SetAllNotificationsSeenAction |
                      SetAllNotificationsSeenSuccessAction;

