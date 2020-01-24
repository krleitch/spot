import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.ADD_SUCCESS: {
        if (state.comments[action.response.postId] === undefined) {
            state.comments[action.response.postId] = [];
        }
        state.comments[action.response.postId].unshift(action.response.comment);
        return {
            ...state,
        };
    }
    case ActionTypes.DELETE_SUCCESS: {
      state.comments[action.response.postId].forEach( (comment, i) => {
        if (comment.id === action.response.commentId) {
          state.comments[action.response.postId].splice(i, 1);
        }
      });
      return {
          ...state,
      };
  }
    case ActionTypes.GET_SUCCESS: {
      if (state.comments[action.response.postId] === undefined) {
        state.comments[action.response.postId] = [];
      }
      state.comments[action.response.postId] = state.comments[action.response.postId].concat(action.response.comments);
      return {
        ...state,
      };
    }
    case ActionTypes.GET_SUCCESS: {
        state.comments[action.response.postId] = action.response.comments;
        return {
          ...state,
        };
    }
    default: {
      return state;
    }
  }
}
