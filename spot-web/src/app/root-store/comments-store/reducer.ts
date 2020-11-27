import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.RESET_STORE: {
      return {
          ...initialState
      };
    }
    case ActionTypes.ADD_COMMENT_REQUEST: {

        let newComments = Object.assign({}, state.comments);

        if (newComments[action.request.postId] === undefined) {
          newComments[action.request.postId] = {
              comments: [],
              totalComments: 0
            };
        }
        newComments[action.request.postId].comments.unshift(action.request.comment);
        return {
            ...state,
            comments: newComments
        };
    }
    case ActionTypes.DELETE_SUCCESS: {

      let newComments = Object.assign({}, state.comments);
      let newReplies = Object.assign({}, state.comments);

      newComments[action.response.postId].comments.forEach( (comment, i) => {
        if (comment.id === action.response.commentId) {
          newComments[action.response.postId].comments.splice(i, 1);
        }
      });
      newReplies[action.response.postId][action.response.commentId].comments = [];
      return {
          ...state,
          comments: newComments,
          replies: newReplies
      };
    }
    case ActionTypes.SET_COMMENTS_REQUEST: {

      let newComments = Object.assign({}, state.comments);

      if (newComments[action.request.postId] === undefined || action.request.initialLoad) {
        newComments[action.request.postId] = {
          comments: []
        };
      }
      if ( action.request.type === 'after' ) {
        newComments[action.request.postId] = {
          comments: action.request.comments.concat(newComments[action.request.postId].comments)
        };
      } else {
        newComments[action.request.postId] = {
          comments: newComments[action.request.postId].comments.concat(action.request.comments)
        };
      }
      return {
        ...state,
        comments: newComments
      };
    }
    case ActionTypes.SET_REPLIES_REQUEST: {

        let newReplies = Object.assign({}, state.replies);

        if (newReplies[action.request.postId] === undefined) {
          newReplies[action.request.postId] = {};
        }
        if (newReplies[action.request.postId][action.request.commentId] === undefined) {
          let newRepliesObj = Object.assign({}, newReplies[action.request.postId]);
          newRepliesObj[action.request.commentId] = {
            replies: []
          };
          newReplies[action.request.postId] = newRepliesObj;
        }
        if ( action.request.initialLoad) {
          let newRepliesObj = Object.assign({}, newReplies[action.request.postId]);
          newRepliesObj[action.request.commentId] = {
            replies: action.request.replies,
          };
          newReplies[action.request.postId] = newRepliesObj;
        } else {
          let newRepliesObj = Object.assign({}, newReplies[action.request.postId]);
          newRepliesObj[action.request.commentId] = {
            replies: newRepliesObj[action.request.commentId].replies.concat(action.request.replies)
          };
          newReplies[action.request.postId] = newRepliesObj;
        }
        return {
          ...state,
          replies: newReplies
        };
    }
    case ActionTypes.ADD_REPLY_REQUEST: {

      let newReplies = Object.assign({}, state.replies);

      if (newReplies[action.request.postId] === undefined) {
        newReplies[action.request.postId] = {};
      }
      if (newReplies[action.request.postId][action.request.commentId] === undefined) {
        let newRepliesObj = Object.assign({}, newReplies[action.request.postId]);
        newRepliesObj[action.request.commentId] = {
          replies: []
        };
        newReplies[action.request.postId] = newRepliesObj;
      }
      let newRepliesObj = Object.assign({}, newReplies[action.request.postId]);
      newRepliesObj[action.request.commentId].replies.push(action.request.reply);
      newReplies[action.request.postId] = newRepliesObj;
      return {
          ...state,
          replies: newReplies
      };
    }
    case ActionTypes.DELETE_REPLY_SUCCESS: {

      let newReplies = Object.assign({}, state.replies);

      newReplies[action.response.postId][action.response.parentId].replies.forEach( (comment, i) => {
        if (comment.id === action.response.commentId) {
          let newRepliesObj = Object.assign({}, newReplies[action.response.postId]);
          newRepliesObj[action.response.parentId].replies.splice(i, 1);
          newReplies[action.response.postId] = newRepliesObj;
        }
      });
      return {
          ...state,
          replies: newReplies
      };
    }
    case ActionTypes.LIKE_SUCCESS: {

      let newComments = Object.assign({}, state.comments);

      newComments[action.response.postId].comments.forEach( (comment , i) => {
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
        comments: newComments
      };
    }
    case ActionTypes.DISLIKE_SUCCESS: {

      let newComments = Object.assign({}, state.comments);

      newComments[action.response.postId].comments.forEach( (comment , i) => {
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
        comments: newComments
      };
    }
    case ActionTypes.UNRATED_SUCCESS: {

      let newComments = Object.assign({}, state.comments);

      newComments[action.response.postId].comments.forEach( (comment , i) => {
        if (comment.id === action.response.commentId) {
          if (comment.rated === 1) {
            comment.likes -= 1;
          } else if ( comment.rated === 0 ) {
            comment.dislikes -= 1;
          }
          comment.rated = -1;
        }
      });
      return {
        ...state,
        comments: newComments
      };
    }
    case ActionTypes.LIKE_REPLY_SUCCESS: {

      let newReplies = Object.assign({}, state.replies);

      newReplies[action.response.postId][action.response.parentId].replies.forEach( (reply , i) => {
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
        replies: newReplies
      };
    }
    case ActionTypes.DISLIKE_REPLY_SUCCESS: {

      let newReplies = Object.assign({}, state.replies);

      newReplies[action.response.postId][action.response.parentId].replies.forEach( (reply , i) => {
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
        replies: newReplies
      };
    }
    case ActionTypes.UNRATED_REPLY_SUCCESS: {

      let newReplies = Object.assign({}, state.replies);

      newReplies[action.response.postId][action.response.parentId].replies.forEach( (reply , i) => {
        if (reply.id === action.response.commentId) {
          if (reply.rated === 1) {
            reply.likes -= 1;
          } else if ( reply.rated === 0 ) {
            reply.dislikes -= 1;
          }
          reply.rated = -1;
        }
      });
      return {
        ...state,
        replies: newReplies
      };
    }
    default: {
      return state;
    }
  }
}
