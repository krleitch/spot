import { Action } from '@ngrx/store';

// Models
import { SpotError } from '@exceptions/error';
import {
  AddUserChatRoomStore,
  AddOpenChatStore,
  RemoveOpenChatStore,
  GetChatRoomsRequest,
  GetChatRoomsResponse,
  AddMinimizedChatStore,
  RemoveMinimizedChatStore,
  GetUserChatRoomsRequest,
  GetUserChatRoomsResponse,
  RemoveUserChatRoomStore
} from '@models/chat';

export enum ActionTypes {
  RESET_STORE = '[Chat] Reset Store',
  GENERIC_FAILURE = '[Chat] Generic Failure',
  GET_CHAT_ROOMS_REQUEST = '[Chat] Get Chat Rooms Request',
  GET_CHAT_ROOMS_SUCCESS = '[Chat] Get Chat Rooms Success',
  GET_CHAT_ROOMS_FAILURE = '[Chat] Get Chat Rooms Failure',
  GET_USER_CHAT_ROOMS_REQUEST = '[Chat] Get User Chat Rooms Request',
  GET_USER_CHAT_ROOMS_SUCCESS = '[Chat] Get User Chat Rooms Success',
  GET_USER_CHAT_ROOMS_FAILURE = '[Chat] Get User Chat Rooms Failure',
  ADD_USER_CHAT_ROOM_STORE = '[Chat] Add User Chat Room Store',
  REMOVE_USER_CHAT_ROOM_STORE = '[Chat] Remove User Chat Room Store',
  ADD_OPEN_CHAT_STORE = '[Chat] Add Open Chat Store',
  REMOVE_OPEN_CHAT_STORE = '[Chat] Remove Open Chat Store',
  ADD_MINIMIZED_CHAT_STORE = '[Chat] Add Minimized Chat Store',
  REMOVE_MINIMIZED_CHAT_STORE = '[Chat] Remove Minimized Chat Store'
}

// Generic Actions
export class ResetStoreAction implements Action {
  readonly type = ActionTypes.RESET_STORE;
  constructor() {}
}
export class GenericFailureAction implements Action {
  readonly type = ActionTypes.GENERIC_FAILURE;
  constructor(public error: SpotError) {}
}

// GET ROOMS
export class GetChatRoomsRequestAction implements Action {
  readonly type = ActionTypes.GET_CHAT_ROOMS_REQUEST;
  constructor(public request: GetChatRoomsRequest) {}
}
export class GetChatRoomsSuccessAction implements Action {
  readonly type = ActionTypes.GET_CHAT_ROOMS_SUCCESS;
  constructor(public response: GetChatRoomsResponse) {}
}
export class GetChatRoomsFailureAction implements Action {
  readonly type = ActionTypes.GET_CHAT_ROOMS_FAILURE;
  constructor(public error: SpotError) {}
}
export class GetUserChatRoomsRequestAction implements Action {
  readonly type = ActionTypes.GET_USER_CHAT_ROOMS_REQUEST;
  constructor(public request: GetUserChatRoomsRequest) {}
}
export class GetUserChatRoomsSuccessAction implements Action {
  readonly type = ActionTypes.GET_USER_CHAT_ROOMS_SUCCESS;
  constructor(public response: GetUserChatRoomsResponse) {}
}
export class GetUserChatRoomsFailureAction implements Action {
  readonly type = ActionTypes.GET_USER_CHAT_ROOMS_FAILURE;
  constructor(public error: SpotError) {}
}

// Store Add/Set Actions
export class AddUserChatRoomStoreAction implements Action {
  readonly type = ActionTypes.ADD_USER_CHAT_ROOM_STORE;
  constructor(public request: AddUserChatRoomStore) {}
}
export class RemoveUserChatRoomStoreAction implements Action {
  readonly type = ActionTypes.REMOVE_USER_CHAT_ROOM_STORE;
  constructor(public request: RemoveUserChatRoomStore) {}
}
export class AddOpenChatStoreAction implements Action {
  readonly type = ActionTypes.ADD_OPEN_CHAT_STORE;
  constructor(public request: AddOpenChatStore) {}
}
export class RemoveOpenChatStoreAction implements Action {
  readonly type = ActionTypes.REMOVE_OPEN_CHAT_STORE;
  constructor(public request: RemoveOpenChatStore) {}
}
export class AddMinimizedChatStoreAction implements Action {
  readonly type = ActionTypes.ADD_MINIMIZED_CHAT_STORE;
  constructor(public request: AddMinimizedChatStore) {}
}
export class RemoveMinimizedChatStoreAction implements Action {
  readonly type = ActionTypes.REMOVE_MINIMIZED_CHAT_STORE;
  constructor(public request: RemoveMinimizedChatStore) {}
}

export type Actions =
  | GenericFailureAction
  | ResetStoreAction
  | GetChatRoomsRequestAction
  | GetChatRoomsFailureAction
  | GetChatRoomsSuccessAction
  | AddUserChatRoomStoreAction
  | RemoveUserChatRoomStoreAction
  | AddOpenChatStoreAction
  | RemoveOpenChatStoreAction
  | AddMinimizedChatStoreAction
  | RemoveMinimizedChatStoreAction
  | GetUserChatRoomsRequestAction
  | GetUserChatRoomsSuccessAction
  | GetUserChatRoomsFailureAction;
