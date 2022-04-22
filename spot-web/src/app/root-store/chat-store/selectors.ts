import {
  MemoizedSelector,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';
import { State } from './state';

// Models
import { ChatRoom } from '@models/chat';

// Store selectors
export const selectChatRoomsFromStore = (state: State): ChatRoom[] =>
  state.chatRooms;
export const selectUserChatRoomsFromStore = (state: State): ChatRoom[] =>
  state.userChatRooms;
export const selectOpenChatsFromStore = (state: State): ChatRoom[] =>
  state.openChats;
export const selectMinimizedChatsFromStore = (state: State): ChatRoom[] =>
  state.minimizedChats;
export const selectChatState: MemoizedSelector<object, State> =
  createFeatureSelector<State>('chat');

// Selectors
export const selectChatRooms: MemoizedSelector<object, ChatRoom[]> =
  createSelector(selectChatState, selectChatRoomsFromStore);

export const selectUserChatRooms: MemoizedSelector<object, ChatRoom[]> =
  createSelector(selectChatState, selectUserChatRoomsFromStore);

export const selectOpenChats: MemoizedSelector<object, ChatRoom[]> =
  createSelector(selectChatState, selectOpenChatsFromStore);

export const selectMinimizedChats: MemoizedSelector<object, ChatRoom[]> =
  createSelector(selectChatState, selectMinimizedChatsFromStore);
