import { createSelector, createFeatureSelector, MemoizedSelector, MemoizedSelectorWithProps } from '@ngrx/store';

import { State } from './state';

export const selectComments = (state: State, postId: string): any => {
  if (state.comments[postId] === undefined) {
    return { comments: [], totalComments: 0 };
  }
  return state.comments[postId];
};
export const selectReplies = (state: State, postId: string, commentId): any => {
  if (state.replies[postId] === undefined) {
    return { replies: [], totalReplies: 0 };
  }
  if (state.replies[postId][commentId] === undefined) {
    return { replies: [], totalReplies: 0 };
  }
  return state.replies[postId][commentId];
};


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
