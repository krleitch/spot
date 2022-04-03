import {
  MemoizedSelector,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';
import { State } from './state';

// Models
import { ChatRoom, ChatTab } from '@models/chat';

// Store selectors
export const selectChatRoomsFromStore = (state: State): ChatRoom[] =>
  state.chatRooms;
export const selectOpenChatsFromStore = (state: State): ChatTab[] =>
  state.openChats;
export const selectMinimizedChatsFromStore = (state: State): ChatTab[] =>
  state.minimizedChats;
export const selectChatState: MemoizedSelector<object, State> =
  createFeatureSelector<State>('chat');

// Selectors
export const selectChatRooms: MemoizedSelector<object, ChatRoom[]> =
  createSelector(selectChatState, selectChatRoomsFromStore);

export const selectOpenChats: MemoizedSelector<object, ChatTab[]> =
  createSelector(selectChatState, selectOpenChatsFromStore);

export const selectMinimizedChats: MemoizedSelector<object, ChatTab[]> =
  createSelector(selectChatState, selectMinimizedChatsFromStore);
