import {
  MemoizedSelector,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';
import { State } from './state';

// Models
import { ChatRoom, ChatPagination, ChatTab } from '@models/chat';

// Store selectors
export const selectUserChatRoomsFromStore = (state: State): ChatRoom[] =>
  state.userChatRooms;
export const selectUserChatRoomsPaginationFromStore = (
  state: State
): ChatPagination => state.userChatRoomsPagination;
export const selectOpenChatsFromStore = (state: State): ChatTab[] =>
  state.openChats;
export const selectMinimizedChatsFromStore = (state: State): ChatTab[] =>
  state.minimizedChats;
export const selectLoadingUserChatRoomsFromStore = (state: State): boolean =>
  state.loadingUserChatRooms;
export const selectChatPageOpenChatFromStore = (state: State): ChatTab =>
  state.chatPageOpenChat;
export const selectChatPageMinimizedChatsFromStore = (state: State): ChatTab[] =>
  state.chatPageMinimizedChats;
export const selectChatState: MemoizedSelector<object, State> =
  createFeatureSelector<State>('chat');

// Selectors
export const selectUserChatRooms: MemoizedSelector<object, ChatRoom[]> =
  createSelector(selectChatState, selectUserChatRoomsFromStore);

export const selectUserChatRoomsPagination: MemoizedSelector<
  object,
  ChatPagination
> = createSelector(selectChatState, selectUserChatRoomsPaginationFromStore);

export const selectOpenChats: MemoizedSelector<object, ChatTab[]> =
  createSelector(selectChatState, selectOpenChatsFromStore);

export const selectLoadingUserChatRooms: MemoizedSelector<object, boolean> =
  createSelector(selectChatState, selectLoadingUserChatRoomsFromStore);

export const selectMinimizedChats: MemoizedSelector<object, ChatTab[]> =
  createSelector(selectChatState, selectMinimizedChatsFromStore);

export const selectChatPageOpenChat: MemoizedSelector<object, ChatTab> =
  createSelector(selectChatState, selectChatPageOpenChatFromStore);

export const selectChatPageMinimizedChats: MemoizedSelector<object, ChatTab[]> =
  createSelector(selectChatState, selectChatPageMinimizedChatsFromStore);
