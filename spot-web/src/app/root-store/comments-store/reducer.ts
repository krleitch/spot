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
            addCommentSuccess: { success: true, id: action.response.postId }
        };
    }
    case ActionTypes.ADD_FAILURE: {
      return {
          ...state,
          addCommentError: { error: action.error, id: action.id }
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
        if ( action.response.initialLoad) {
          state.replies[action.response.postId][action.response.commentId] = {
            replies: action.response.replies,
            totalReplies: action.response.totalReplies
          };
        } else {
          state.replies[action.response.postId][action.response.commentId] = {
            replies: state.replies[action.response.postId][action.response.commentId].replies.concat(action.response.replies),
            totalReplies: action.response.totalReplies
          };
        }
        return {
          ...state
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
      state.replies[action.response.postId][action.response.commentId].replies.push(action.response.reply);
      return {
          ...state,
          addReplySuccess: { success: true, id: action.response.reply.comment_parent_id }
      };
    }
    case ActionTypes.ADD_REPLY_FAILURE: {
      return {
          ...state,
          addReplyError: { error: action.error, id: action.id }
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
