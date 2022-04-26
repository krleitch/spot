import {
  MemoizedSelector,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';
import { State } from './state';

// Models
import { ChatRoom, ChatPagination } from '@models/chat';

// Store selectors
export const selectChatRoomsFromStore = (state: State): ChatRoom[] =>
  state.chatRooms;
export const selectChatRoomsPaginationFromStore = (
  state: State
): ChatPagination => state.chatRoomsPagination;
export const selectUserChatRoomsFromStore = (state: State): ChatRoom[] =>
  state.userChatRooms;
export const selectUserChatRoomsPaginationFromStore = (
  state: State
): ChatPagination => state.userChatRoomsPagination;
export const selectOpenChatsFromStore = (state: State): ChatRoom[] =>
  state.openChats;
export const selectMinimizedChatsFromStore = (state: State): ChatRoom[] =>
  state.minimizedChats;
export const selectLoadingChatRoomsFromStore = (state: State): boolean =>
  state.loadingChatRooms;
export const selectLoadingUserChatRoomsFromStore = (state: State): boolean =>
  state.loadingUserChatRooms;
export const selectChatState: MemoizedSelector<object, State> =
  createFeatureSelector<State>('chat');

// Selectors
export const selectChatRooms: MemoizedSelector<object, ChatRoom[]> =
  createSelector(selectChatState, selectChatRoomsFromStore);

export const selectChatRoomsPagination: MemoizedSelector<
  object,
  ChatPagination
> = createSelector(selectChatState, selectChatRoomsPaginationFromStore);

export const selectUserChatRooms: MemoizedSelector<object, ChatRoom[]> =
  createSelector(selectChatState, selectUserChatRoomsFromStore);

export const selectUserChatRoomsPagination: MemoizedSelector<
  object,
  ChatPagination
> = createSelector(selectChatState, selectUserChatRoomsPaginationFromStore);

export const selectOpenChats: MemoizedSelector<object, ChatRoom[]> =
  createSelector(selectChatState, selectOpenChatsFromStore);

export const selectLoadingChatRooms: MemoizedSelector<object, boolean> =
  createSelector(selectChatState, selectLoadingChatRoomsFromStore);

export const selectLoadingUserChatRooms: MemoizedSelector<object, boolean> =
  createSelector(selectChatState, selectLoadingUserChatRoomsFromStore);

export const selectMinimizedChats: MemoizedSelector<object, ChatRoom[]> =
  createSelector(selectChatState, selectMinimizedChatsFromStore);
