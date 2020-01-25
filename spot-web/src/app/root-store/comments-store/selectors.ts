import { createSelector, createFeatureSelector, MemoizedSelector, MemoizedSelectorWithProps } from '@ngrx/store';

import { State } from './state';

export const selectComments = (state: State, postId: string): Comment[] => state.comments[postId];
export const selectReplies = (state: State, postId: string, commentId): Comment[] => {
  if (state.replies[postId] === undefined) {
    return [];
  }
  return state.replies[postId][commentId];
}

export const selectMyFeatureState: MemoizedSelector<
  object,
  State
> = createFeatureSelector<State>('comments');

export const selectMyFeatureComments: MemoizedSelectorWithProps<
  object,
  any,
  any[]
> = createSelector(
  selectMyFeatureState,
  (state, props) => selectComments(state, props.postId)
);

export const selectMyFeatureReplies: MemoizedSelectorWithProps<
  object,
  any,
  any[]
> = createSelector(
  selectMyFeatureState,
  (state, props) => selectReplies(state, props.postId, props.commentId)
);
