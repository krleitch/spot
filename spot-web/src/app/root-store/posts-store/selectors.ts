import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';

import { State } from './state';

export const selectPosts = (state: State): any[] => state.posts;

export const selectMyFeatureState: MemoizedSelector<
  object,
  State
> = createFeatureSelector<State>('posts');

export const selectMyFeaturePosts: MemoizedSelector<
  object,
  any[]
> = createSelector(
  selectMyFeatureState,
  selectPosts
);
