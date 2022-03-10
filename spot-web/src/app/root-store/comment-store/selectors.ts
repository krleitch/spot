import {
  MemoizedSelector,
  MemoizedSelectorWithProps,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';

import { State, StoreComment, StoreReply } from './state';

export const selectTaggedFromStore = (
  state: State,
  spotId: string,
  commentId: string
): boolean => {
  // Check existence first
  if (state.comments[spotId] === undefined) {
    return false;
  }
  if (state.comments[spotId][commentId] === undefined) {
    return false;
  }
  return state.comments[spotId][commentId].tagged;
};

export const selectCommentsFromStore = (
  state: State,
  spotId: string
): StoreComment => {
  // Check existence first
  if (state.comments[spotId] === undefined) {
    return {
      comments: [],
      totalCommentsBefore: 0,
      totalCommentsAfter: 0
    };
  }
  return state.comments[spotId];
};

export const selectRepliesFromStore = (
  state: State,
  spotId: string,
  commentId
): StoreReply => {
  // Check existence first
  if (state.replies[spotId] === undefined) {
    return {
      replies: [],
      tagged: false,
      totalRepliesAfter: 0
    };
  }
  if (state.replies[spotId][commentId] === undefined) {
    return {
      replies: [],
      tagged: false,
      totalRepliesAfter: 0
    };
  }
  return state.replies[spotId][commentId];
};

export const selectCommentsState: MemoizedSelector<object, State> =
  createFeatureSelector<State>('comment');

export const selectTagged: MemoizedSelectorWithProps<object, any, boolean> =
  createSelector(selectCommentsState, (state, props) =>
    selectTaggedFromStore(state, props.spotId, props.commentId)
  );

export const selectComments: MemoizedSelectorWithProps<
  object,
  any,
  StoreComment
> = createSelector(selectCommentsState, (state, props) =>
  selectCommentsFromStore(state, props.spotId)
);

export const selectReplies: MemoizedSelectorWithProps<object, any, StoreReply> =
  createSelector(selectCommentsState, (state, props) =>
    selectRepliesFromStore(state, props.spotId, props.commentId)
  );
