import { createSelector, createFeatureSelector, MemoizedSelector, MemoizedSelectorWithProps } from '@ngrx/store';
import { SpotError } from '@exceptions/error';

import { State } from './state';

export const AddReply2Error = (state: State): { error: SpotError, id: string } => state.addReply2Error;
export const AddReply2Success = (state: State): { success: boolean, id: string } => state.addReply2Success;

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

export const selectAddReply2Error: MemoizedSelector<object,{ error: SpotError, id: string }> = createSelector(
  selectMyFeatureState,
  AddReply2Error
);

export const selectAddReply2Success: MemoizedSelector<object,{ success: boolean, id: string }> = createSelector(
  selectMyFeatureState,
  AddReply2Success
);
