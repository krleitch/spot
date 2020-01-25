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
      state.replies[action.response.postId][action.response.commentId] = [];
      return {
          ...state,
      };
    }
    case ActionTypes.GET_SUCCESS: {
      if (state.comments[action.response.postId] === undefined) {
        state.comments[action.response.postId] = [];
      }
      // Error of if you navigate back to page...
      state.comments[action.response.postId] = state.comments[action.response.postId].concat(action.response.comments);
      return {
        ...state,
      };
    }
    case ActionTypes.GET_REPLY_SUCCESS: {
        if (state.replies[action.response.postId] === undefined) {
          state.replies[action.response.postId] = {};
        }
        if (state.replies[action.response.postId][action.response.commentId] === undefined) {
          state.replies[action.response.postId][action.response.commentId] = [];
        }
        state.replies[action.response.postId][action.response.commentId] =
          state.replies[action.response.postId][action.response.commentId].concat(action.response.replies);
        return {
          ...state,
        };
    }
    case ActionTypes.ADD_REPLY_SUCCESS: {
      if (state.replies[action.response.postId] === undefined) {
        state.replies[action.response.postId] = {};
      }
      if (state.replies[action.response.postId][action.response.commentId] === undefined) {
        state.replies[action.response.postId][action.response.commentId] = [];
      }
      state.replies[action.response.postId][action.response.commentId].unshift(action.response.reply);
      return {
          ...state,
      };
    }
    case ActionTypes.DELETE_REPLY_SUCCESS: {
      state.replies[action.response.postId][action.response.parentId].forEach( (comment, i) => {
        if (comment.id === action.response.commentId) {
          state.replies[action.response.postId][action.response.parentId].splice(i, 1);
        }
      });
      return {
          ...state,
      };
    }
    default: {
      return state;
    }
  }
}
