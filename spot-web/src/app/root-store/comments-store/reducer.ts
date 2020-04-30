import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.ADD_SUCCESS: {
        const comments = { ...state.comments };
        if (comments[action.response.postId] === undefined) {
            comments[action.response.postId] = {
              comments: [],
              totalComments: 0
            };
        }
        comments[action.response.postId].comments.unshift(action.response.comment);
        return {
            ...state,
            comments
        };
    }
    case ActionTypes.DELETE_SUCCESS: {
      const comments = { ...state.comments };
      const replies = { ...state.replies };
      comments[action.response.postId].comments.forEach( (comment, i) => {
        if (comment.id === action.response.commentId) {
          comments[action.response.postId].comments.splice(i, 1);
        }
      });
      replies[action.response.postId][action.response.commentId].comments = [];
      return {
          ...state,
          comments,
          replies
      };
    }
    case ActionTypes.GET_SUCCESS: {
      const comments = { ...state.comments };
      if (comments[action.response.postId] === undefined) {
        comments[action.response.postId] = {
          comments: [],
          totalComments: 0
        };
      }
      if ( action.response.offset === 0 ) {
        comments[action.response.postId] = {
          comments: action.response.comments,
          totalComments: action.response.totalComments
        };
      } else {
        comments[action.response.postId] = {
          comments: comments[action.response.postId].comments.concat(action.response.comments),
          totalComments: action.response.totalComments
        };
      }
      return {
        ...state,
        comments
      };
    }
    case ActionTypes.GET_REPLY_SUCCESS: {
        let replies = { ...state.replies };
        if (replies[action.response.postId] === undefined) {
          replies[action.response.postId] = {};
        }
        if (replies[action.response.postId][action.response.commentId] === undefined) {
          replies[action.response.postId][action.response.commentId] = {
            replies: [],
            totalReplies: 0
          };
        }
        if ( action.response.offset === 0 ) {
          replies[action.response.postId][action.response.commentId] = {
            replies: action.response.replies,
            totalReplies: action.response.totalReplies
          };
        } else {
          const r = { ... replies[action.response.postId][action.response.commentId] };
          r.replies = replies[action.response.postId][action.response.commentId].replies.concat(action.response.replies);
          r.totalReplies = action.response.totalReplies;
          // replies[action.response.postId][action.response.commentId] = {
          //   replies: replies[action.response.postId][action.response.commentId].replies.concat(action.response.replies),
          //   totalReplies: action.response.totalReplies
          // };
          replies = {
            ...replies,
            [action.response.postId]: { ...replies[action.response.postId], [action.response.commentId]:
               { ...replies[action.response.postId][action.response.commentId], r }}
          }
        }
        return {
          ...state,
          replies
        };
    }
    case ActionTypes.ADD_REPLY_SUCCESS: {
      const replies = { ...state.replies };
      if (replies[action.response.postId] === undefined) {
        replies[action.response.postId] = {};
      }
      if (replies[action.response.postId][action.response.commentId] === undefined) {
        replies[action.response.postId][action.response.commentId] = {
          replies: [],
          totalReplies: 0
        };
      }
      replies[action.response.postId][action.response.commentId].replies.push(action.response.reply);
      return {
          ...state,
          replies
      };
    }
    case ActionTypes.DELETE_REPLY_SUCCESS: {
      const replies = { ...state.replies };
      replies[action.response.postId][action.response.parentId].replies.forEach( (comment, i) => {
        if (comment.id === action.response.commentId) {
          replies[action.response.postId][action.response.parentId].replies.splice(i, 1);
        }
      });
      return {
          ...state,
          replies
      };
    }
    case ActionTypes.LIKE_SUCCESS: {
      const comments = { ...state.comments };
      comments[action.response.postId].comments.forEach( (comment , i) => {
        if (comment.id === action.response.commentId) {
          comment.likes += 1;
          if (comment.rated === 0) {
            comment.dislikes -= 1;
          }
          comment.rated = 1;
        }
      });
      return {
        ...state,
        comments
      };
    }
    case ActionTypes.DISLIKE_SUCCESS: {
      const comments = { ...state.comments };
      comments[action.response.postId].comments.forEach( (comment , i) => {
        if (comment.id === action.response.commentId) {
          comment.dislikes += 1;
          if (comment.rated === 1) {
            comment.likes -= 1;
          }
          comment.rated = 0;
        }
      });
      return {
        ...state,
        comments
      };
    }
    case ActionTypes.LIKE_REPLY_SUCCESS: {
      const replies = { ...state.replies };
      replies[action.response.postId][action.response.parentId].replies.forEach( (reply , i) => {
        if (reply.id === action.response.commentId) {
          reply.likes += 1;
          if (reply.rated === 0) {
            reply.dislikes -= 1;
          }
          reply.rated = 1;
        }
      });
      return {
        ...state,
        replies
      };
    }
    case ActionTypes.DISLIKE_REPLY_SUCCESS: {
      const replies = { ...state.replies };
      replies[action.response.postId][action.response.parentId].replies.forEach( (reply , i) => {
        if (reply.id === action.response.commentId) {
          reply.dislikes += 1;
          if (reply.rated === 1) {
            reply.likes -= 1;
          }
          reply.rated = 0;
        }
      });
      return {
        ...state,
        replies
      };
    }
    default: {
      return state;
    }
  }
}
