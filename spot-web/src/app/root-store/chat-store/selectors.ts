import {
  MemoizedSelector,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';
import { State } from './state';

// Models
import { ChatRoom } from '@models/chat';

export const selectChatRoomsFromStore = (state: State): ChatRoom[] =>
  state.chatRooms;

export const selectChatState: MemoizedSelector<object, State> =
  createFeatureSelector<State>('chat');

export const selectChatRooms: MemoizedSelector<object, ChatRoom[]> =
  createSelector(selectChatState, selectChatRoomsFromStore);
