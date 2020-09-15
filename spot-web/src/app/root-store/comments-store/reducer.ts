import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.ADD_COMMENT_REQUEST: {
        if (state.comments[action.request.postId] === undefined) {
            state.comments[action.request.postId] = {
              comments: [],
              totalComments: 0
            };
        }
        state.comments[action.request.postId].comments.unshift(action.request.comment);
        return {
            ...state
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
          ...state
      };
    }
    case ActionTypes.SET_COMMENTS_REQUEST: {
      if (state.comments[action.request.postId] === undefined || action.request.initialLoad) {
        state.comments[action.request.postId] = {
          comments: []
        };
      }
      if ( action.request.type === 'after' ) {
        state.comments[action.request.postId] = {
          comments: action.request.comments.concat(state.comments[action.request.postId].comments)
        };
      } else {
        state.comments[action.request.postId] = {
          comments: state.comments[action.request.postId].comments.concat(action.request.comments)
        };
      }
      return {
        ...state
      };
    }
    case ActionTypes.SET_REPLIES_REQUEST: {
        if (state.replies[action.request.postId] === undefined) {
          state.replies[action.request.postId] = {};
        }
        if (state.replies[action.request.postId][action.request.commentId] === undefined) {
          state.replies[action.request.postId][action.request.commentId] = {
            replies: []
          };
        }
        if ( action.request.initialLoad) {
          state.replies[action.request.postId][action.request.commentId] = {
            replies: action.request.replies,
          };
        } else {
          state.replies[action.request.postId][action.request.commentId] = {
            replies: state.replies[action.request.postId][action.request.commentId].replies.concat(action.request.replies)
          };
        }
        return {
          ...state
        };
    }
    case ActionTypes.ADD_REPLY_REQUEST: {
      if (state.replies[action.request.postId] === undefined) {
        state.replies[action.request.postId] = {};
      }
      if (state.replies[action.request.postId][action.request.commentId] === undefined) {
        state.replies[action.request.postId][action.request.commentId] = {
          replies: []
        };
      }
      state.replies[action.request.postId][action.request.commentId].replies.push(action.request.reply);
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
          ...state
      };
    }
    case ActionTypes.LIKE_SUCCESS: {
      state.comments[action.response.postId].comments.forEach( (comment , i) => {
        if (comment.id === action.response.commentId) {
          comment.likes += 1;
          if (comment.rated === 0) {
            comment.dislikes -= 1;
          }
          comment.rated = 1;
        }
      });
      return {
        ...state
      };
    }
    case ActionTypes.DISLIKE_SUCCESS: {
      state.comments[action.response.postId].comments.forEach( (comment , i) => {
        if (comment.id === action.response.commentId) {
          comment.dislikes += 1;
          if (comment.rated === 1) {
            comment.likes -= 1;
          }
          comment.rated = 0;
        }
      });
      return {
        ...state
      };
    }
    case ActionTypes.LIKE_REPLY_SUCCESS: {
      state.replies[action.response.postId][action.response.parentId].replies.forEach( (reply , i) => {
        if (reply.id === action.response.commentId) {
          reply.likes += 1;
          if (reply.rated === 0) {
            reply.dislikes -= 1;
          }
          reply.rated = 1;
        }
      });
      return {
        ...state
      };
    }
    case ActionTypes.DISLIKE_REPLY_SUCCESS: {
      state.replies[action.response.postId][action.response.parentId].replies.forEach( (reply , i) => {
        if (reply.id === action.response.commentId) {
          reply.dislikes += 1;
          if (reply.rated === 1) {
            reply.likes -= 1;
          }
          reply.rated = 0;
        }
      });
      return {
        ...state
      };
    }
    default: {
      return state;
    }
  }
}
