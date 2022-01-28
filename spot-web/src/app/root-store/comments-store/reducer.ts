import { ActionTypes, Actions } from './actions';
import { State, initialState } from './state';
import { Comment } from '@models/comments';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.RESET_STORE: {
      return {
        ...initialState
      };
    }
    case ActionTypes.CLEAR_COMMENTS_REQUEST: {
      const newComments = Object.assign({}, state.comments);
      newComments[action.request.postId] = {
        comments: [],
        totalCommentsBefore: 0,
        totalCommentsAfter: 0
      };
      const newReplies = Object.assign({}, state.replies);
      newReplies[action.request.postId] = {};
      return {
        comments: newComments,
        replies: newReplies
      };
    }
    case ActionTypes.ADD_COMMENT_REQUEST: {
      const newComments = Object.assign({}, state.comments);
      if (newComments[action.request.postId] === undefined) {
        // initialize the comments
        newComments[action.request.postId] = {
          comments: [action.request.comment],
          totalCommentsAfter: 0,
          totalCommentsBefore: 0
        };
      } else {
        // otherwise just add the comment
        const newArr = Array.from(newComments[action.request.postId].comments);
        newArr.unshift(action.request.comment);
        newComments[action.request.postId] = {
          ...newComments[action.request.postId],
          comments: newArr
        };
      }
      return {
        ...state,
        comments: newComments
      };
    }
    case ActionTypes.DELETE_SUCCESS: {
      const newComments = Object.assign({}, state.comments);

      newComments[action.response.postId].comments.forEach((comment, i) => {
        if (comment.id === action.response.commentId) {
          const newObj = Object.assign({}, newComments[action.response.postId]);
          const newArr = Array.from(newObj.comments);
          newArr.splice(i, 1);
          newObj.comments = newArr;
          newComments[action.response.postId] = newObj;
        }
      });

      const newReplies = Object.assign({}, state.replies);
      const newRepliesInner = Object.assign(
        {},
        newReplies[action.response.postId]
      );
      delete newRepliesInner[action.response.commentId];
      newReplies[action.response.postId] = newRepliesInner;

      return {
        ...state,
        comments: newComments,
        replies: newReplies
      };
    }
    case ActionTypes.SET_COMMENTS_REQUEST: {
      const newComments = Object.assign({}, state.comments);

      // initialize if needed
      if (
        newComments[action.request.postId] === undefined ||
        action.request.initialLoad
      ) {
        newComments[action.request.postId] = {
          comments: [],
          totalCommentsAfter: 0,
          totalCommentsBefore: 0
        };
      }

      const newTotalCommentsAfter = action.request.hasOwnProperty(
        'totalCommentsAfter'
      )
        ? action.request.totalCommentsAfter
        : newComments[action.request.postId].totalCommentsAfter;
      const newTotalCommentsBefore = action.request.hasOwnProperty(
        'totalCommentsBefore'
      )
        ? action.request.totalCommentsBefore
        : newComments[action.request.postId].totalCommentsBefore;

      // after or before
      if (action.request.type === 'after') {
        newComments[action.request.postId] = {
          comments: action.request.comments.concat(
            newComments[action.request.postId].comments
          ),
          totalCommentsAfter: newTotalCommentsAfter,
          totalCommentsBefore: newTotalCommentsBefore
        };
      } else {
        newComments[action.request.postId] = {
          comments: newComments[action.request.postId].comments.concat(
            action.request.comments
          ),
          totalCommentsAfter: newTotalCommentsAfter,
          totalCommentsBefore: newTotalCommentsBefore
        };
      }
      return {
        ...state,
        comments: newComments
      };
    }
    case ActionTypes.SET_REPLIES_REQUEST: {
      const newReplies = Object.assign({}, state.replies);

      if (newReplies[action.request.postId] === undefined) {
        newReplies[action.request.postId] = {};
      }
      if (
        newReplies[action.request.postId][action.request.commentId] ===
        undefined
      ) {
        const newRepliesObj = Object.assign(
          {},
          newReplies[action.request.postId]
        );
        newRepliesObj[action.request.commentId] = {
          replies: [],
          tagged: false,
          totalRepliesAfter: 0
        };
        newReplies[action.request.postId] = newRepliesObj;
      }
      const newTag =
        newReplies[action.request.postId][action.request.commentId].tagged ||
        action.request.replies.filter((x: Comment) => x.tag.tagged).length > 0;

      if (action.request.initialLoad) {
        const newRepliesObj = Object.assign(
          {},
          newReplies[action.request.postId]
        );
        newRepliesObj[action.request.commentId] = {
          replies: action.request.replies,
          tagged: newTag,
          totalRepliesAfter: action.request.totalRepliesAfter
        };
        newReplies[action.request.postId] = newRepliesObj;
      } else {
        const newRepliesObj = Object.assign(
          {},
          newReplies[action.request.postId]
        );
        newRepliesObj[action.request.commentId] = {
          replies: newRepliesObj[action.request.commentId].replies.concat(
            action.request.replies
          ),
          tagged: newTag,
          totalRepliesAfter: action.request.totalRepliesAfter
        };
        newReplies[action.request.postId] = newRepliesObj;
      }
      return {
        ...state,
        replies: newReplies
      };
    }
    case ActionTypes.ADD_REPLY_REQUEST: {
      const newReplies = Object.assign({}, state.replies);

      // initialize outer object
      if (newReplies[action.request.postId] === undefined) {
        newReplies[action.request.postId] = {};
      }
      // initialize or add to inner
      if (
        newReplies[action.request.postId][action.request.commentId] ===
        undefined
      ) {
        const newRepliesInner = {};
        newRepliesInner[action.request.commentId] = {
          replies: [action.request.reply]
        };
        newReplies[action.request.postId] = newRepliesInner;
      } else {
        const newRepliesInner = Object.assign(
          {},
          newReplies[action.request.postId]
        );
        const newArr = Array.from(
          newRepliesInner[action.request.commentId].replies
        );
        newArr.push(action.request.reply);
        const newTag =
          action.request.reply.tag.tagged ||
          newRepliesInner[action.request.commentId].tagged;
        newRepliesInner[action.request.commentId] = {
          ...newRepliesInner[action.request.commentId],
          replies: newArr,
          tagged: newTag
        };
        newReplies[action.request.postId] = newRepliesInner;
      }
      return {
        ...state,
        replies: newReplies
      };
    }
    case ActionTypes.DELETE_REPLY_SUCCESS: {
      const newReplies = Object.assign({}, state.replies);
      const newRepliesInner = Object.assign(
        {},
        newReplies[action.response.postId]
      );

      newRepliesInner[action.response.parentId].replies.forEach(
        (comment, i) => {
          if (comment.id === action.response.commentId) {
            const newArr = Array.from(
              newRepliesInner[action.response.parentId].replies
            );
            newArr.splice(i, 1);
            const newTag =
              newArr.filter((x: Comment) => x.tag.tagged).length > 0;
            newRepliesInner[action.response.parentId] = {
              ...newRepliesInner[action.response.parentId],
              replies: newArr,
              tagged: newTag
            };
          }
        }
      );
      newReplies[action.response.postId] = newRepliesInner;
      return {
        ...state,
        replies: newReplies
      };
    }
    case ActionTypes.LIKE_SUCCESS: {
      const newComments = Object.assign({}, state.comments);
      const newArr = Array.from(newComments[action.response.postId].comments);

      newComments[action.response.postId].comments.forEach(
        (comment: any, i) => {
          if (comment.id === action.response.commentId) {
            const newObj = Object.assign({}, comment);
            newObj.likes += 1;
            if (comment.rated === 0) {
              newObj.dislikes -= 1;
            }
            newObj.rated = 1;
            newArr[i] = newObj;
          }
        }
      );
      newComments[action.response.postId] = {
        ...newComments[action.response.postId],
        comments: newArr
      };
      return {
        ...state,
        comments: newComments
      };
    }
    case ActionTypes.DISLIKE_SUCCESS: {
      const newComments = Object.assign({}, state.comments);
      const newArr = Array.from(newComments[action.response.postId].comments);

      newComments[action.response.postId].comments.forEach((comment, i) => {
        if (comment.id === action.response.commentId) {
          const newObj = Object.assign({}, comment);
          newObj.dislikes += 1;
          if (comment.rated === 1) {
            newObj.likes -= 1;
          }
          newObj.rated = 0;
          newArr[i] = newObj;
        }
      });
      newComments[action.response.postId] = {
        ...newComments[action.response.postId],
        comments: newArr
      };
      return {
        ...state,
        comments: newComments
      };
    }
    case ActionTypes.UNRATED_SUCCESS: {
      const newComments = Object.assign({}, state.comments);
      const newArr = Array.from(newComments[action.response.postId].comments);

      newComments[action.response.postId].comments.forEach((comment, i) => {
        if (comment.id === action.response.commentId) {
          const newObj = Object.assign({}, comment);
          if (comment.rated === 1) {
            newObj.likes -= 1;
          } else if (comment.rated === 0) {
            newObj.dislikes -= 1;
          }
          newObj.rated = -1;
          newArr[i] = newObj;
        }
      });
      newComments[action.response.postId] = {
        ...newComments[action.response.postId],
        comments: newArr
      };
      return {
        ...state,
        comments: newComments
      };
    }
    case ActionTypes.LIKE_REPLY_SUCCESS: {
      const newReplies = Object.assign({}, state.replies);
      const newRepliesInner = Object.assign(
        {},
        newReplies[action.response.postId]
      );
      const newArr = Array.from(
        newReplies[action.response.postId][action.response.parentId].replies
      );
      const newTag =
        newReplies[action.response.postId][action.response.parentId].tagged;

      newReplies[action.response.postId][
        action.response.parentId
      ].replies.forEach((reply, i) => {
        if (reply.id === action.response.commentId) {
          const newObj = Object.assign({}, reply);
          newObj.likes += 1;
          if (reply.rated === 0) {
            newObj.dislikes -= 1;
          }
          newObj.rated = 1;
          newArr[i] = newObj;
        }
      });
      newRepliesInner[action.response.parentId] = {
        ...newRepliesInner[action.response.parentId],
        replies: newArr,
        tagged: newTag
      };
      newReplies[action.response.postId] = newRepliesInner;
      return {
        ...state,
        replies: newReplies
      };
    }
    case ActionTypes.DISLIKE_REPLY_SUCCESS: {
      const newReplies = Object.assign({}, state.replies);
      const newRepliesInner = Object.assign(
        {},
        newReplies[action.response.postId]
      );
      const newArr = Array.from(
        newReplies[action.response.postId][action.response.parentId].replies
      );
      const newTag =
        newReplies[action.response.postId][action.response.parentId].tagged;

      newReplies[action.response.postId][
        action.response.parentId
      ].replies.forEach((reply, i) => {
        if (reply.id === action.response.commentId) {
          const newObj = Object.assign({}, reply);
          newObj.dislikes += 1;
          if (reply.rated === 1) {
            newObj.likes -= 1;
          }
          newObj.rated = 0;
          newArr[i] = newObj;
        }
      });
      newRepliesInner[action.response.parentId] = {
        ...newRepliesInner[action.response.parentId],
        replies: newArr,
        tagged: newTag
      };
      newReplies[action.response.postId] = newRepliesInner;
      return {
        ...state,
        replies: newReplies
      };
    }
    case ActionTypes.UNRATED_REPLY_SUCCESS: {
      const newReplies = Object.assign({}, state.replies);
      const newRepliesInner = Object.assign(
        {},
        newReplies[action.response.postId]
      );
      const newArr = Array.from(
        newReplies[action.response.postId][action.response.parentId].replies
      );
      const newTag =
        newReplies[action.response.postId][action.response.parentId].tagged;

      newReplies[action.response.postId][
        action.response.parentId
      ].replies.forEach((reply, i) => {
        if (reply.id === action.response.commentId) {
          const newObj = Object.assign({}, reply);
          if (reply.rated === 1) {
            newObj.likes -= 1;
          } else if (reply.rated === 0) {
            newObj.dislikes -= 1;
          }
          newObj.rated = -1;
          newArr[i] = newObj;
        }
      });
      newRepliesInner[action.response.parentId] = {
        ...newRepliesInner[action.response.parentId],
        replies: newArr,
        tagged: newTag
      };
      newReplies[action.response.postId] = newRepliesInner;
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
