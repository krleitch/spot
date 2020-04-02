import { Action } from '@ngrx/store';

import { } from '@models/friends';

export enum ActionTypes {
  GET_FRIENDS_REQUEST = '[Social Friends] Get Friends Request',
  GET_FRIENDS_SUCCESS = '[Social Friends] Get Friends Success',
  GENERIC_FAILURE = '[Social Friends] Generic Failure'
}

export class GenericFailureAction implements Action {
  readonly type = ActionTypes.GENERIC_FAILURE;
  constructor(public error: string) {}
}

export class GetNotificationsAction implements Action {
  readonly type = ActionTypes.GET_FRIENDS_REQUEST;
  constructor(public request: any) {}
}

export class GetNotificationsSuccessAction implements Action {
  readonly type = ActionTypes.GET_FRIENDS_SUCCESS;
  constructor(public response: any) {}
}

export type Actions = GenericFailureAction | GetNotificationsAction | GetNotificationsSuccessAction;

