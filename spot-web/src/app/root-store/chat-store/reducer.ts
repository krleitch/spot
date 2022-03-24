import { ActionTypes, Actions } from './actions';
import { State, initialState } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.RESET_STORE: {
      return {
        ...initialState
      };
    }
    default: {
      return state;
    }
  }
}
