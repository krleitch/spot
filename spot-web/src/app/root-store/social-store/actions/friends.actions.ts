import { Action } from '@ngrx/store';

import { GetFriendsRequest, GetFriendsSuccess, DeleteFriendsRequest, DeleteFriendsSuccess,
            AddFriendToStore } from '@models/friends';

import { SpotError } from '@exceptions/error';

export enum FriendsActionTypes {
    GENERIC_FAILURE = '[Social Friends] Generic Failure',
    GET_FRIENDS_REQUEST = '[Social Friends] Get Friends Request',
    GET_FRIENDS_SUCCESS = '[Social Friends] Get Friends Success',
    GET_FRIENDS_FAILURE = '[Social Friends] Get Friends Failure',
    DELETE_FRIENDS_REQUEST = '[Social Friends] Delete Friends Request',
    DELETE_FRIENDS_SUCCESS = '[Social Friends] Delete Friends Success',
    DELETE_FRIENDS_FAILURE = '[Social Friends] Delete Friends Failure',
    ADD_FRIEND = '[Social Friends] Add Friend',
}

export class GenericFailureAction implements Action {
  readonly type = FriendsActionTypes.GENERIC_FAILURE;
  constructor(public error: SpotError) {}
}

export class GetFriendsRequestAction implements Action {
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

export class DeleteFriendsRequestAction implements Action {
    readonly type = FriendsActionTypes.DELETE_FRIENDS_REQUEST;
    constructor(public request: DeleteFriendsRequest) {}
}

export class DeleteFriendsSuccessAction implements Action {
    readonly type = FriendsActionTypes.DELETE_FRIENDS_SUCCESS;
    constructor(public response: DeleteFriendsSuccess) {}
}

export class DeleteFriendsFailureAction implements Action {
    readonly type = FriendsActionTypes.DELETE_FRIENDS_FAILURE;
    constructor(public response: SpotError) {}
}

export class AddFriendAction implements Action {
    readonly type = FriendsActionTypes.ADD_FRIEND;
    constructor(public request: AddFriendToStore) {}
}

export type FriendsActions = GenericFailureAction | GetFriendsRequestAction | GetFriendsSuccessAction |
                                GetFriendsFailureAction | DeleteFriendsRequestAction |
                                DeleteFriendsSuccessAction | DeleteFriendsFailureAction |
                                AddFriendAction;

