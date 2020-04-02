import { Action } from '@ngrx/store';

import { GetFriendRequestsRequest, GetFriendRequestsSuccess, AddFriendRequestsRequest,
            AddFriendRequestsSuccess } from '@models/friends';

export enum ActionTypes {
  GET_FRIEND_REQUESTS_REQUEST = '[Social Friends] Get Friend Requests Request',
  GET_FRIEND_REQUESTS_SUCCESS = '[Social Friends] Get Friend Requests Success',
  ADD_FRIEND_REQUESTS_REQUEST = '[Social Friends] Add Friend Requests Request',
  ADD_FRIEND_REQUESTS_SUCCESS = '[Social Friends] Add Friend Requests Success',
  GENERIC_FAILURE = '[Social Friends] Generic Failure'
}

export class GenericFailureAction implements Action {
  readonly type = ActionTypes.GENERIC_FAILURE;
  constructor(public error: string) {}
}

export class GetFriendRequestsAction implements Action {
  readonly type = ActionTypes.GET_FRIEND_REQUESTS_REQUEST;
  constructor(public request: GetFriendRequestsRequest) {}
}

export class GetFriendRequestsSuccessAction implements Action {
  readonly type = ActionTypes.GET_FRIEND_REQUESTS_SUCCESS;
  constructor(public response: GetFriendRequestsSuccess) {}
}

export class AddFriendRequestsAction implements Action {
    readonly type = ActionTypes.ADD_FRIEND_REQUESTS_REQUEST;
    constructor(public request: AddFriendRequestsRequest) {}
}

export class AddFriendRequestsSuccessAction implements Action {
    readonly type = ActionTypes.ADD_FRIEND_REQUESTS_SUCCESS;
    constructor(public response: AddFriendRequestsSuccess) {}
}

export type Actions = GenericFailureAction | GetFriendRequestsAction | GetFriendRequestsSuccessAction |
                        AddFriendRequestsAction | AddFriendRequestsSuccessAction;

