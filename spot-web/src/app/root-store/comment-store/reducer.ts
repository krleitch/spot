import { ActionTypes, Actions } from './actions';
import { State, initialState } from './state';
import { Comment, CommentRatingType } from '@models/../newModels/comment';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.RESET_STORE: {
      return {
        ...initialState
      };
    }
    case ActionTypes.CLEAR_COMMENTS_REQUEST: {
      const newComments = Object.assign({}, state.comments);
      newComments[action.request.spotId] = {
        comments: [],
        totalCommentsBefore: 0,
        totalCommentsAfter: 0
      };
      const newReplies = Object.assign({}, state.replies);
      newReplies[action.request.spotId] = {};
      return {
        comments: newComments,
        replies: newReplies
      };
    }
    case ActionTypes.ADD_COMMENT_REQUEST: {
      const newComments = Object.assign({}, state.comments);
      if (newComments[action.request.comment.spotId] === undefined) {
        // initialize the comments
        newComments[action.request.comment.spotId] = {
          comments: [action.request.comment],
          totalCommentsAfter: 0,
          totalCommentsBefore: 0
        };
      } else {
        // otherwise just add the comment
        const newArr = Array.from(
          newComments[action.request.comment.spotId].comments
        );
        newArr.unshift(action.request.comment);
        newComments[action.request.comment.spotId] = {
          ...newComments[action.request.comment.spotId],
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

      newComments[action.response.spotId].comments.forEach((comment, i) => {
        if (comment.commentId === action.response.commentId) {
          const newObj = Object.assign({}, newComments[action.response.spotId]);
          const newArr = Array.from(newObj.comments);
          newArr.splice(i, 1);
          newObj.comments = newArr;
          newComments[action.response.spotId] = newObj;
        }
      });

      const newReplies = Object.assign({}, state.replies);
      const newRepliesInner = Object.assign(
        {},
        newReplies[action.response.spotId]
      );
      delete newRepliesInner[action.response.commentId];
      newReplies[action.response.spotId] = newRepliesInner;

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
        newComments[action.request.spotId] === undefined ||
        action.request.initialLoad
      ) {
        newComments[action.request.spotId] = {
          comments: [],
          totalCommentsAfter: 0,
          totalCommentsBefore: 0
        };
      }

      const newTotalCommentsAfter = Object.prototype.hasOwnProperty.call(
        action.request,
        'totalCommentsAfter'
      )
        ? action.request.totalCommentsAfter
        : newComments[action.request.spotId].totalCommentsAfter;
      const newTotalCommentsBefore = Object.prototype.hasOwnProperty.call(
        action.request,
        'totalCommentsBefore'
      )
        ? action.request.totalCommentsBefore
        : newComments[action.request.spotId].totalCommentsBefore;

      // after or before
      if (action.request.type === 'after') {
        newComments[action.request.spotId] = {
          comments: action.request.comments.concat(
            newComments[action.request.spotId].comments
          ),
          totalCommentsAfter: newTotalCommentsAfter,
          totalCommentsBefore: newTotalCommentsBefore
        };
      } else {
        newComments[action.request.spotId] = {
          comments: newComments[action.request.spotId].comments.concat(
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

      if (newReplies[action.request.spotId] === undefined) {
        newReplies[action.request.spotId] = {};
      }
      if (
        newReplies[action.request.spotId][action.request.commentId] ===
        undefined
      ) {
        const newRepliesObj = Object.assign(
          {},
          newReplies[action.request.spotId]
        );
        newRepliesObj[action.request.commentId] = {
          replies: [],
          tagged: false,
          totalRepliesAfter: 0
        };
        newReplies[action.request.spotId] = newRepliesObj;
      }
      const newTag =
        newReplies[action.request.spotId][action.request.commentId].tagged ||
        action.request.replies.filter((x: Comment) => x.tag.tagged).length > 0;

      if (action.request.initialLoad) {
        const newRepliesObj = Object.assign(
          {},
          newReplies[action.request.spotId]
        );
        newRepliesObj[action.request.commentId] = {
          replies: action.request.replies,
          tagged: newTag,
          totalRepliesAfter: action.request.totalRepliesAfter
        };
        newReplies[action.request.spotId] = newRepliesObj;
      } else {
        const newRepliesObj = Object.assign(
          {},
          newReplies[action.request.spotId]
        );
        newRepliesObj[action.request.commentId] = {
          replies: newRepliesObj[action.request.commentId].replies.concat(
            action.request.replies
          ),
          tagged: newTag,
          totalRepliesAfter: action.request.totalRepliesAfter
        };
        newReplies[action.request.spotId] = newRepliesObj;
      }
      return {
        ...state,
        replies: newReplies
      };
    }
    case ActionTypes.ADD_REPLY_REQUEST: {
      const newReplies = Object.assign({}, state.replies);

      // initialize outer object
      if (newReplies[action.request.reply.spotId] === undefined) {
        newReplies[action.request.reply.spotId] = {};
      }
      // initialize or add to inner
      if (
        newReplies[action.request.reply.spotId][
          action.request.reply.parentCommentId
        ] === undefined
      ) {
        const newRepliesInner = {};
        newRepliesInner[action.request.reply.parentCommentId] = {
          replies: [action.request.reply]
        };
        newReplies[action.request.reply.spotId] = newRepliesInner;
      } else {
        const newRepliesInner = Object.assign(
          {},
          newReplies[action.request.reply.spotId]
        );
        const newArr = Array.from(
          newRepliesInner[action.request.reply.parentCommentId].replies
        );
        newArr.push(action.request.reply);
        const newTag =
          action.request.reply.tag.tagged ||
          newRepliesInner[action.request.reply.parentCommentId].tagged;
        newRepliesInner[action.request.reply.parentCommentId] = {
          ...newRepliesInner[action.request.reply.parentCommentId],
          replies: newArr,
          tagged: newTag
        };
        newReplies[action.request.reply.spotId] = newRepliesInner;
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
        newReplies[action.response.spotId]
      );

      newRepliesInner[action.response.commentId].replies.forEach(
        (comment, i) => {
          if (comment.commentId === action.response.replyId) {
            const newArr = Array.from(
              newRepliesInner[action.response.commentId].replies
            );
            newArr.splice(i, 1);
            const newTag =
              newArr.filter((x: Comment) => x.tag.tagged).length > 0;
            newRepliesInner[action.response.commentId] = {
              ...newRepliesInner[action.response.commentId],
              replies: newArr,
              tagged: newTag
            };
          }
        }
      );
      newReplies[action.response.spotId] = newRepliesInner;
      return {
        ...state,
        replies: newReplies
      };
    }
    case ActionTypes.RATE_SUCCESS: {
      const newComments = Object.assign({}, state.comments);
      const newArr = Array.from(newComments[action.response.spotId].comments);

      newComments[action.response.spotId].comments.forEach(
        (comment: Comment, i) => {
          if (comment.commentId === action.response.commentId) {
            const newObj = Object.assign({}, comment);
            // remove old rating
            if (comment.myRating === CommentRatingType.LIKE) {
              newObj.likes -= 1;
            }
            if (comment.myRating === CommentRatingType.DISLIKE) {
              newObj.dislikes -= 1;
            }
            switch (action.response.rating) {
              case CommentRatingType.LIKE:
                newObj.likes += 1;
                break;
              case CommentRatingType.DISLIKE:
                newObj.dislikes += 1;
                break;
              case CommentRatingType.NONE:
                break;
              default:
                break;
            }
            newObj.myRating = action.response.rating;
            newArr[i] = newObj;
          }
        }
      );
      newComments[action.response.spotId] = {
        ...newComments[action.response.spotId],
        comments: newArr
      };
      return {
        ...state,
        comments: newComments
      };
    }
    case ActionTypes.RATE_REPLY_SUCCESS: {
      const newReplies = Object.assign({}, state.replies);
      const newRepliesInner = Object.assign(
        {},
        newReplies[action.response.spotId]
      );
      const newArr = Array.from(
        newReplies[action.response.spotId][action.response.commentId].replies
      );
      const newTag =
        newReplies[action.response.spotId][action.response.commentId].tagged;

      newReplies[action.response.spotId][
        action.response.commentId
      ].replies.forEach((reply, i) => {
        if (reply.commentId === action.response.replyId) {
          const newObj = Object.assign({}, reply);
          if (reply.myRating === CommentRatingType.LIKE) {
            newObj.likes -= 1;
          }
          if (reply.myRating === CommentRatingType.DISLIKE) {
            newObj.dislikes -= 1;
          }
          switch (action.response.rating) {
            case CommentRatingType.LIKE:
              newObj.likes += 1;
              break;
            case CommentRatingType.DISLIKE:
              newObj.dislikes += 1;
              break;
            case CommentRatingType.NONE:
              break;
            default:
              break;
          }
          newObj.myRating = action.response.rating;
          newArr[i] = newObj;
        }
      });
      newRepliesInner[action.response.commentId] = {
        ...newRepliesInner[action.response.commentId],
        replies: newArr,
        tagged: newTag
      };
      newReplies[action.response.spotId] = newRepliesInner;
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
