import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { Post } from '@models/posts';
import { SpotError } from '@exceptions/error';

import { State } from './state';

export const selectPosts = (state: State): Post[] => state.posts;
export const selectLoading = (state: State): boolean => state.loading;
export const selectCreateError = (state: State): SpotError => state.createError;
export const selectCreateSuccess = (state: State): boolean => state.createSuccess;
export const selectStateNoPosts = (state: State): boolean => state.noPosts;

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

export const selectCreatePostsError: MemoizedSelector<object, SpotError> = createSelector(
  selectMyFeatureState,
  selectCreateError
);

export const selectCreatePostsSuccess: MemoizedSelector<object, boolean> = createSelector(
  selectMyFeatureState,
  selectCreateSuccess
);

export const selectNoPosts: MemoizedSelector<object, boolean> = createSelector(
  selectMyFeatureState,
  selectStateNoPosts
);
