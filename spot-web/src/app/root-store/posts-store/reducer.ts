import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.LOAD_REQUEST: {
      return {
        ...state,
        loading: true
      };
    }
    case ActionTypes.LOAD_SUCCESS: {
      if ( action.response.offset === 0 ) {
        return {
          ...state,
          posts:  action.response.posts,
          loading: false
        };
      } else {
        return {
          ...state,
          posts: state.posts.concat(action.response.posts),
          loading: false
        };
      }
    }
    case ActionTypes.ADD_SUCCESS: {
      state.posts.unshift(action.response.post);
      return {
        ...state
      };
    }
    case ActionTypes.LIKE_SUCCESS: {
      state.posts.forEach( (post , i) => {
        if (post.id === action.response.postId) {
          post.likes += 1;
          if (post.rated === 0) {
            post.dislikes -= 1;
          }
          post.rated = 1;
        }
      });
      return {
        ...state
      };
    }
    case ActionTypes.DISLIKE_SUCCESS: {
      state.posts.forEach( (post , i) => {
        if (post.id === action.response.postId) {
          post.dislikes += 1;
          if (post.rated === 1) {
            post.likes -= 1;
          }
          post.rated = 0;
        }
      });
      return {
        ...state
      };
    }
    case ActionTypes.DELETE_SUCCESS: {
      state.posts.forEach( (post , i) => {
        if (post.id === action.response.postId) {
          state.posts.splice(i, 1);
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
