import { Action } from '@ngrx/store';

import { GetFriendRequestsRequest, GetFriendRequestsSuccess, AddFriendRequestsRequest,
            AddFriendRequestsSuccess, DeleteFriendRequestsRequest, DeleteFriendRequestsSuccess,
            AcceptFriendRequestsRequest, AcceptFriendRequestsSuccess, DeclineFriendRequestsRequest,
            DeclineFriendRequestsSuccess } from '@models/friends';

export enum FriendsActionTypes {
  GET_FRIEND_REQUESTS_REQUEST = '[Social Friends] Get Friend Requests Request',
  GET_FRIEND_REQUESTS_SUCCESS = '[Social Friends] Get Friend Requests Success',
  ADD_FRIEND_REQUESTS_REQUEST = '[Social Friends] Add Friend Requests Request',
  ADD_FRIEND_REQUESTS_SUCCESS = '[Social Friends] Add Friend Requests Success',
  ACCEPT_FRIEND_REQUESTS_REQUEST = '[Social Friends] Accept Friend Requests Request',
  ACCEPT_FRIEND_REQUESTS_SUCCESS = '[Social Friends] Accept Friend Requests Success',
  DECLINE_FRIEND_REQUESTS_REQUEST = '[Social Friends] Decline Friend Requests Request',
  DECLINE_FRIEND_REQUESTS_SUCCESS = '[Social Friends] Decline Friend Requests Success',
  DELETE_FRIEND_REQUESTS_REQUEST = '[Social Friends] Delete Friend Requests Request',
  DELETE_FRIEND_REQUESTS_SUCCESS = '[Social Friends] Delete Friend Requests Success',
  GENERIC_FAILURE = '[Social Friends] Generic Failure'
}

export class GenericFailureAction implements Action {
  readonly type = FriendsActionTypes.GENERIC_FAILURE;
  constructor(public error: string) {}
}

export class GetFriendRequestsAction implements Action {
  readonly type = FriendsActionTypes.GET_FRIEND_REQUESTS_REQUEST;
  constructor(public request: GetFriendRequestsRequest) {}
}

export class GetFriendRequestsSuccessAction implements Action {
  readonly type = FriendsActionTypes.GET_FRIEND_REQUESTS_SUCCESS;
  constructor(public response: GetFriendRequestsSuccess) {}
}

export class AddFriendRequestsAction implements Action {
    readonly type = FriendsActionTypes.ADD_FRIEND_REQUESTS_REQUEST;
    constructor(public request: AddFriendRequestsRequest) {}
}

export class AddFriendRequestsSuccessAction implements Action {
    readonly type = FriendsActionTypes.ADD_FRIEND_REQUESTS_SUCCESS;
    constructor(public response: AddFriendRequestsSuccess) {}
}

export class DeleteFriendRequestsAction implements Action {
    readonly type = FriendsActionTypes.DELETE_FRIEND_REQUESTS_REQUEST;
    constructor(public request: DeleteFriendRequestsRequest) {}
}

export class DeleteFriendRequestsSuccessAction implements Action {
    readonly type = FriendsActionTypes.DELETE_FRIEND_REQUESTS_SUCCESS;
    constructor(public response: DeleteFriendRequestsSuccess) {}
}

export class AcceptFriendRequestsAction implements Action {
    readonly type = FriendsActionTypes.ACCEPT_FRIEND_REQUESTS_REQUEST;
    constructor(public request: AcceptFriendRequestsRequest) {}
}

export class AcceptFriendRequestsSuccessAction implements Action {
    readonly type = FriendsActionTypes.ACCEPT_FRIEND_REQUESTS_SUCCESS;
    constructor(public response: AcceptFriendRequestsSuccess) {}
}

export class DeclineFriendRequestsAction implements Action {
    readonly type = FriendsActionTypes.DECLINE_FRIEND_REQUESTS_REQUEST;
    constructor(public request: DeclineFriendRequestsRequest) {}
}

export class DeclineFriendRequestsSuccessAction implements Action {
    readonly type = FriendsActionTypes.DECLINE_FRIEND_REQUESTS_SUCCESS;
    constructor(public response: DeclineFriendRequestsSuccess) {}
}

export type FriendsActions = GenericFailureAction | GetFriendRequestsAction | GetFriendRequestsSuccessAction |
                        AddFriendRequestsAction | AddFriendRequestsSuccessAction | DeleteFriendRequestsAction |
                        DeleteFriendRequestsSuccessAction | AcceptFriendRequestsAction | AcceptFriendRequestsSuccessAction |
                        DeclineFriendRequestsAction | DeclineFriendRequestsSuccessAction;

