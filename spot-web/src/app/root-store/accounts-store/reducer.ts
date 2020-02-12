import { Actions, ActionTypes } from './actions/actions';
import { FacebookActions, FacebookActionTypes } from './actions/facebook.action';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions | FacebookActions): State {
  switch (action.type) {
    case ActionTypes.REGISTER_SUCCESS: {
      return {
        ...state,
        account: action.response.account
      };
    }
    case ActionTypes.REGISTER_FAILURE: {
      return {
        ...state,
        account: null
      };
    }
    case ActionTypes.LOGIN_SUCCESS: {
      return {
        ...state,
        account: action.response.account
      };
    }
    case ActionTypes.LOGIN_FAILURE: {
      return {
        ...state,
        account: null
      };
    }
    case ActionTypes.LOGOUT_REQUEST: {
      return {
        ...state,
        account: null
      };
    }
    case ActionTypes.DELETE_SUCCESS: {
      return {
        ...state,
        account: null
      };
    }
    case ActionTypes.SET_LOCATION: {
      return {
        ...state,
        location: action.request.location
      };
    }
    case ActionTypes.ACCOUNT_SUCCESS: {
      return {
        ...state,
        account: action.response.account
      };
    }
    case FacebookActionTypes.FACEBOOK_REGISTER_SUCCESS: {
      return {
        ...state,
        account: action.response.user
      };
    }
    case FacebookActionTypes.FACEBOOK_LOGIN_SUCCESS: {
      return {
        ...state,
        account: action.response.user
      };
    }
    default: {
      return state;
    }
  }
}
