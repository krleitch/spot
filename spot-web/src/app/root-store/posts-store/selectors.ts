import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { Post } from '@models/posts';
import { SpotError } from '@exceptions/error';

import { State } from './state';

export const selectPostsFromStore = (state: State): Post[] => state.posts;
export const selectLoadingFromStore = (state: State): boolean => state.loading;
export const selectCreatePostsErrorFromStore = (state: State): SpotError => state.createError;
export const selectCreatePostsSuccessFromStore = (state: State): boolean => state.createSuccess;
export const selectNoPostsFromStore = (state: State): boolean => state.noPosts;

export const selectPostsState: MemoizedSelector<object,  State> = createFeatureSelector<State>('posts');

export const selectPosts: MemoizedSelector<object, Post[]> = createSelector(
  selectPostsState,
  selectPostsFromStore
);

export const selectLoading: MemoizedSelector<object, boolean> = createSelector(
  selectPostsState,
  selectLoadingFromStore
);

export const selectCreatePostsError: MemoizedSelector<object, SpotError> = createSelector(
  selectPostsState,
  selectCreatePostsErrorFromStore
);

export const selectCreatePostsSuccess: MemoizedSelector<object, boolean> = createSelector(
  selectPostsState,
  selectCreatePostsSuccessFromStore
);

export const selectNoPosts: MemoizedSelector<object, boolean> = createSelector(
  selectPostsState,
  selectNoPostsFromStore
);
