import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.RESET_STORE: {
      return {
        ...initialState,
      };
    }
    case ActionTypes.LOAD_REQUEST: {
      if ( action.request.initialLoad ) {
        // state.posts = [];
      }
      return {
        ...state,
        loading: true,
        noPosts: false,
      };
    }
    case ActionTypes.LOAD_SUCCESS: {
      if ( action.response.initialLoad ) {
        return {
          ...state,
          posts:  action.response.posts,
          loading: false,
          noPosts: action.response.posts.length === 0,
        };
      } else {
        // only need to concat if we have posts
        if ( action.response.posts.length === 0 ) {
          return {
            ...state,
            loading: false,
            noPosts: true,
          };
        } else {
          return {
            ...state,
            posts: state.posts.concat(action.response.posts),
            loading: false,
            noPosts: false,
          };
        }
      }
    }
    case ActionTypes.ADD_REQUEST: {
      return {
        ...state,
        createSuccess: false
      };
    }
    case ActionTypes.ADD_SUCCESS: {

      let newPosts = Array.from(state.posts);

      newPosts.unshift(action.response.post);
      return {
        ...state,
        createSuccess: true,
        posts: newPosts
      };
    }
    case ActionTypes.ADD_FAILURE: {
      return {
        ...state,
        createError: action.error,
        createSuccess: false
      };
    }
    case ActionTypes.LIKE_SUCCESS: {

      let newPosts = Array.from(state.posts);

      newPosts.forEach( (post , i) => {
        if (post.id === action.response.postId) {
          let newObj =  Object.assign({}, post);
          newObj.likes += 1;
          if (post.rated === 0) {
            newObj.dislikes -= 1;
          }
          newObj.rated = 1;
          newPosts[i] = newObj;
        }
      });
      return {
        ...state,
        posts: newPosts
      };
    }
    case ActionTypes.DISLIKE_SUCCESS: {

      let newPosts = Array.from(state.posts);

      newPosts.forEach( (post , i) => {
        if (post.id === action.response.postId) {
          let newObj =  Object.assign({}, post);
          newObj.dislikes += 1;
          if (post.rated === 1) {
            newObj.likes -= 1;
          }
          newObj.rated = 0;
          newPosts[i] = newObj;
        }
      });
      return {
        ...state,
        posts: newPosts
      };
    }
    case ActionTypes.UNRATED_SUCCESS: {

      let newPosts = Array.from(state.posts);

      newPosts.forEach( (post , i) => {
        if (post.id === action.response.postId) {
          let newObj =  Object.assign({}, post);
          if (post.rated === 1) {
            newObj.likes -= 1;
          } else if ( post.rated === 0 ) {
            newObj.dislikes -= 1;
          }
          newObj.rated = -1;
          newPosts[i] = newObj;
        }
      });
      return {
        ...state,
        posts: newPosts
      };
    }
    case ActionTypes.DELETE_SUCCESS: {

      let newPosts = Array.from(state.posts);

      newPosts.forEach( (post , i) => {
        if (post.id === action.response.postId) {
          newPosts.splice(i, 1);
        }
      });
      return {
        ...state,
        posts: newPosts
      };
    }
    default: {
      return state;
    }
  }
}
