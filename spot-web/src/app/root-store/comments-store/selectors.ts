import { createSelector, createFeatureSelector, MemoizedSelector, MemoizedSelectorWithProps } from '@ngrx/store';

import { State, StoreComment, StoreReply } from './state';

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
