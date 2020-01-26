import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.ADD_SUCCESS: {
        if (state.comments[action.response.postId] === undefined) {
            state.comments[action.response.postId] = {
              comments: [],
              totalComments: 0
            };
        }
        state.comments[action.response.postId].comments.unshift(action.response.comment);
        return {
            ...state,
        };
    }
    case ActionTypes.DELETE_SUCCESS: {
      state.comments[action.response.postId].comments.forEach( (comment, i) => {
        if (comment.id === action.response.commentId) {
          state.comments[action.response.postId].comments.splice(i, 1);
        }
      });
      state.replies[action.response.postId][action.response.commentId].comments = [];
      return {
          ...state,
      };
    }
    case ActionTypes.GET_SUCCESS: {
      if (state.comments[action.response.postId] === undefined) {
        state.comments[action.response.postId] = {
          comments: [],
          totalComments: 0
        };
      }
      // Error of if you navigate back to page...
      state.comments[action.response.postId] = {
        comments: state.comments[action.response.postId].comments.concat(action.response.comments),
        totalComments: action.response.totalComments
      }
      return {
        ...state,
      };
    }
    case ActionTypes.GET_REPLY_SUCCESS: {
        if (state.replies[action.response.postId] === undefined) {
          state.replies[action.response.postId] = {};
        }
        if (state.replies[action.response.postId][action.response.commentId] === undefined) {
          state.replies[action.response.postId][action.response.commentId] = {
            replies: [],
            totalReplies: 0
          };
        }
        state.replies[action.response.postId][action.response.commentId] = {
          replies: state.replies[action.response.postId][action.response.commentId].replies.concat(action.response.replies),
          totalReplies: action.response.totalReplies
        }
        return {
          ...state,
        };
    }
    case ActionTypes.ADD_REPLY_SUCCESS: {
      if (state.replies[action.response.postId] === undefined) {
        state.replies[action.response.postId] = {};
      }
      if (state.replies[action.response.postId][action.response.commentId] === undefined) {
        state.replies[action.response.postId][action.response.commentId] = {
          replies: [],
          totalReplies: 0
        };
      }
      state.replies[action.response.postId][action.response.commentId].replies.unshift(action.response.reply);
      return {
          ...state,
      };
    }
    case ActionTypes.DELETE_REPLY_SUCCESS: {
      state.replies[action.response.postId][action.response.parentId].replies.forEach( (comment, i) => {
        if (comment.id === action.response.commentId) {
          state.replies[action.response.postId][action.response.parentId].replies.splice(i, 1);
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
