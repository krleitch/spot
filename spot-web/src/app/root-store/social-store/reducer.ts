import { Actions, ActionTypes } from './actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.GET_NOTIFICATIONS_SUCCESS: {
      return {
        ...state,
      };
    }
    default: {
      return state;
    }
  }
}
