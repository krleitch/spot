import { createSelector, createFeatureSelector, MemoizedSelector, MemoizedSelectorWithProps } from '@ngrx/store';

import { State, StoreComment, StoreReply } from './state';

import { SpotError } from '@exceptions/error';
import { Comment } from '@models/comments';
import { AnyFn } from '@ngrx/store/src/selector';

// TODO: Remove these
export const AddReply2Error = (state: State): { error: SpotError, id: string } => state.addReply2Error;
export const AddReply2Success = (state: State): { success: boolean, id: string } => state.addReply2Success;

export const selectCommentsFromStore = (state: State, postId: string): StoreComment => {
  // Check existence first
  if (state.comments[postId] === undefined) {
    return { comments: [], tagged: false };
  }
  return state.comments[postId];
};
export const selectRepliesFromStore = (state: State, postId: string, commentId): StoreReply => {
  // Check existence first
  if (state.replies[postId] === undefined) {
    return { replies: [] };
  }
  if (state.replies[postId][commentId] === undefined) {
    return { replies: [] };
  }
  return state.replies[postId][commentId];
};

export const selectCommentsState: MemoizedSelector<object, State> = createFeatureSelector<State>('comments');

export const selectComments: MemoizedSelectorWithProps<object, any, StoreComment> = createSelector(
  selectCommentsState,
  (state, props) => selectCommentsFromStore(state, props.postId)
);

export const selectReplies: MemoizedSelectorWithProps<object, any, StoreReply> = createSelector(
  selectCommentsState,
  (state, props) => selectRepliesFromStore(state, props.postId, props.commentId)
);

export const selectAddReply2Error: MemoizedSelector<object, { error: SpotError, id: string }> = createSelector(
  selectCommentsState,
  AddReply2Error
);

export const selectAddReply2Success: MemoizedSelector<object, { success: boolean, id: string }> = createSelector(
  selectCommentsState,
  AddReply2Success
);
