import { Action } from '@ngrx/store';

// Models
import { SpotError } from '@exceptions/error';
import {
  AddChatRoomStore,
  GetChatRoomsRequest,
  GetChatRoomsResponse
} from '@models/chat';

export enum ActionTypes {
  RESET_STORE = '[Chat] Reset Store',
  GENERIC_FAILURE = '[Chat] Generic Failure',
  GET_CHAT_ROOMS_REQUEST = '[Chat] Get Chat Rooms Request',
  GET_CHAT_ROOMS_SUCCESS = '[Chat] Get Chat Rooms Success',
  GET_CHAT_ROOMS_FAILURE = '[Chat] Get Chat Rooms Failure',
  ADD_CHAT_ROOM_STORE = ' [Chat] Add Chat Room Store'
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

// Store Add/Set Actions
export class AddChatRoomStoreAction implements Action {
  readonly type = ActionTypes.ADD_CHAT_ROOM_STORE;
  constructor(public request: AddChatRoomStore) {}
}

export type Actions =
  | GenericFailureAction
  | ResetStoreAction
  | GetChatRoomsRequestAction
  | GetChatRoomsFailureAction
  | GetChatRoomsSuccessAction
  | AddChatRoomStoreAction;
