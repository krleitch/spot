import { createSelector, createFeatureSelector, MemoizedSelector, MemoizedSelectorWithProps } from '@ngrx/store';

import { State } from './state';

export const selectComments = (state: State, postId: string): Comment[] => state.comments[postId];

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

