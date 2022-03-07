import { Action } from '@ngrx/store';

import {
  AddFriendToStore,
  DeleteFriendRequest,
  DeleteFriendResponse,
  GetFriendsRequest,
  GetFriendsResponse
} from '@models/../newModels/friend';

import { SpotError } from '@exceptions/error';

export enum FriendsActionTypes {
  GENERIC_FAILURE = '[Social Friend] Generic Failure',
  GET_FRIENDS_REQUEST = '[Social Friend] Get Friends Request',
  GET_FRIENDS_SUCCESS = '[Social Friend] Get Friends Success',
  GET_FRIENDS_FAILURE = '[Social Friend] Get Friends Failure',
  DELETE_FRIEND_REQUEST = '[Social Friend] Delete Friend Request',
  DELETE_FRIEND_SUCCESS = '[Social Friend] Delete Friend Success',
  DELETE_FRIEND_FAILURE = '[Social Friend] Delete Friend Failure',
  CREATE_FRIEND = '[Social Friend] Add Friend'
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
  constructor(public response: GetFriendsResponse) {}
}

export class GetFriendsFailureAction implements Action {
  readonly type = FriendsActionTypes.GET_FRIENDS_FAILURE;
  constructor(public error: SpotError) {}
}

export class DeleteFriendsRequestAction implements Action {
  readonly type = FriendsActionTypes.DELETE_FRIEND_REQUEST;
  constructor(public request: DeleteFriendRequest) {}
}

export class DeleteFriendsSuccessAction implements Action {
  readonly type = FriendsActionTypes.DELETE_FRIEND_SUCCESS;
  constructor(
    public response: { response: DeleteFriendResponse; friendId: string }
  ) {}
}

export class DeleteFriendsFailureAction implements Action {
  readonly type = FriendsActionTypes.DELETE_FRIEND_FAILURE;
  constructor(public response: SpotError) {}
}

export class AddFriendAction implements Action {
  readonly type = FriendsActionTypes.CREATE_FRIEND;
  constructor(public request: AddFriendToStore) {}
}

export type FriendsActions =
  | GenericFailureAction
  | GetFriendsRequestAction
  | GetFriendsSuccessAction
  | GetFriendsFailureAction
  | DeleteFriendsRequestAction
  | DeleteFriendsSuccessAction
  | DeleteFriendsFailureAction
  | AddFriendAction;
