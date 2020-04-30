import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { Post } from '@models/posts';

import { State } from './state';

export const selectPosts = (state: State): Post[] => state.posts;
export const selectLoading = (state: State): boolean => state.loading;

export const selectMyFeatureState: MemoizedSelector<
  object,
  State
> = createFeatureSelector<State>('posts');

export const selectMyFeaturePosts: MemoizedSelector<
  object,
  Post[]
> = createSelector(
  selectMyFeatureState,
  selectPosts
);

export const selectMyFeatureLoading: MemoizedSelector<
  object,
  boolean
> = createSelector(
  selectMyFeatureState,
  selectLoading
);
