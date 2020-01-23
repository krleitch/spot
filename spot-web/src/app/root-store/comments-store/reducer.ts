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
    case ActionTypes.GET_SUCCESS: {
        state.comments[action.response.postId] = action.response.comments;
        return {
          ...state,
        };
    }
    case ActionTypes.GET_SUCCESS: {
        state.comments[action.response.postId] = action.response.comments;
        return {
          ...state,
        };
    }
    default: {
      return state;
    }
  }
}
