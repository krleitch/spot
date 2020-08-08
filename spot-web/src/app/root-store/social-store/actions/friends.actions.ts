import { Action } from '@ngrx/store';

import { GetFriendRequestsRequest, GetFriendRequestsSuccess, AddFriendRequestsRequest,
            AddFriendRequestsSuccess, DeleteFriendRequestsRequest, DeleteFriendRequestsSuccess,
            AcceptFriendRequestsRequest, AcceptFriendRequestsSuccess, DeclineFriendRequestsRequest,
            DeclineFriendRequestsSuccess, GetFriendsRequest, GetFriendsSuccess, DeleteFriendsRequest,
            DeleteFriendsSuccess } from '@models/friends';

import { SpotError } from '@exceptions/error';

export enum FriendsActionTypes {
  GET_FRIENDS_REQUEST = '[Social Friends] Get Friends Request',
  GET_FRIENDS_SUCCESS = '[Social Friends] Get Friends Success',
  GET_FRIENDS_FAILURE = '[Social Friends] Get Friends Failure',
  DELETE_FRIENDS_REQUEST = '[Social Friends] Delete Friends Request',
  DELETE_FRIENDS_SUCCESS = '[Social Friends] Delete Friends Success',
  GET_FRIEND_REQUESTS_REQUEST = '[Social Friends] Get Friend Requests Request',
  GET_FRIEND_REQUESTS_SUCCESS = '[Social Friends] Get Friend Requests Success',
  ADD_FRIEND_REQUESTS_REQUEST = '[Social Friends] Add Friend Requests Request',
  ADD_FRIEND_REQUESTS_SUCCESS = '[Social Friends] Add Friend Requests Success',
  ADD_FRIEND_REQUESTS_FAILURE = '[Social Friends] Add Friend Requests Failure',
  ACCEPT_FRIEND_REQUESTS_REQUEST = '[Social Friends] Accept Friend Requests Request',
  ACCEPT_FRIEND_REQUESTS_SUCCESS = '[Social Friends] Accept Friend Requests Success',
  DECLINE_FRIEND_REQUESTS_REQUEST = '[Social Friends] Decline Friend Requests Request',
  DECLINE_FRIEND_REQUESTS_SUCCESS = '[Social Friends] Decline Friend Requests Success',
  DELETE_FRIEND_REQUESTS_REQUEST = '[Social Friends] Delete Friend Requests Request', // unused
  DELETE_FRIEND_REQUESTS_SUCCESS = '[Social Friends] Delete Friend Requests Success', // unused
  GENERIC_FAILURE = '[Social Friends] Generic Failure'
}

export class GenericFailureAction implements Action {
  readonly type = FriendsActionTypes.GENERIC_FAILURE;
  constructor(public error: SpotError) {}
}

export class GetFriendsAction implements Action {
    readonly type = FriendsActionTypes.GET_FRIENDS_REQUEST;
    constructor(public request: GetFriendsRequest) {}
}

export class GetFriendsSuccessAction implements Action {
    readonly type = FriendsActionTypes.GET_FRIENDS_SUCCESS;
    constructor(public response: GetFriendsSuccess) {}
}

export class GetFriendsFailureAction implements Action {
    readonly type = FriendsActionTypes.GET_FRIENDS_FAILURE;
    constructor(public error: SpotError) {}
}

export class DeleteFriendsAction implements Action {
    readonly type = FriendsActionTypes.DELETE_FRIENDS_REQUEST;
    constructor(public request: DeleteFriendsRequest) {}
}

export class DeleteFriendsSuccessAction implements Action {
    readonly type = FriendsActionTypes.DELETE_FRIENDS_SUCCESS;
    constructor(public response: DeleteFriendsSuccess) {}
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

export class AddFriendRequestsFailureAction implements Action {
    readonly type = FriendsActionTypes.ADD_FRIEND_REQUESTS_FAILURE;
    constructor(public error: SpotError) {}
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
                        DeclineFriendRequestsAction | DeclineFriendRequestsSuccessAction | GetFriendsAction |
                        GetFriendsSuccessAction | DeleteFriendsAction | DeleteFriendsSuccessAction |
                        AddFriendRequestsFailureAction;

