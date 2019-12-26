import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';

import { State } from './state';

export const selectError = (state: State): any => state.error;
export const selectIsLoading = (state: State): boolean => state.isLoading;
export const selectPosts = (state: State): any[] => state.posts;

export const selectMyFeatureState: MemoizedSelector<
  object,
  State
> = createFeatureSelector<State>('posts');

export const selectMyFeatureError: MemoizedSelector<
  object,
  any
> = createSelector(
  selectMyFeatureState,
  selectError
);

export const selectMyFeatureIsLoading: MemoizedSelector<
  object,
  boolean
> = createSelector(
  selectMyFeatureState,
  selectIsLoading
);

export const selectMyFeaturePosts: MemoizedSelector<
  object,
  any[]
> = createSelector(
  selectMyFeatureState,
  selectPosts
);
