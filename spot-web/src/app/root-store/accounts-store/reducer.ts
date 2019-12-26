import { Actions, ActionTypes } from './actions/actions';
import { FacebookActions, FacebookActionTypes } from './actions/facebook.action';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions | FacebookActions): State {
  switch (action.type) {
    case ActionTypes.LOGIN_REQUEST: {
      return {
        ...state,
        loggedIn: false
      };
    }
    case ActionTypes.LOGIN_SUCCESS: {
        return {
          ...state,
          loggedIn: true,
          idToken: action.payload.response.idToken,
          expireIn: action.payload.response.expireIn,
          user: action.payload.response.user
        };
      }
    case ActionTypes.LOGIN_FAILURE: {
    return {
        ...state,
        loggedIn: false,
        error: action.payload.error
      };
    }
    case ActionTypes.LOGOUT_REQUEST: {
        return {
            ...state,
            loggedIn: false
        };
    }
    case ActionTypes.DELETE_SUCCESS: {
        return {
            ...state,
            loggedIn: false
        };
    }
    case ActionTypes.ACCOUNT_SUCCESS: {
        return {
            ...state,
            loggedIn: true,
            user: action.payload.response
        };
    }
    case FacebookActionTypes.FACEBOOK_REGISTER_SUCCESS: {
        return {
          ...state,
          loggedIn: true,
          user: action.response.user
        };
    }
    case FacebookActionTypes.FACEBOOK_REGISTER_FAILURE: {
        return {
          ...state,
          loggedIn: false
        };
    }
    case FacebookActionTypes.FACEBOOK_LOGIN_SUCCESS: {
        return {
          ...state,
          loggedIn: true,
          user: action.response.user
        };
    }
    case FacebookActionTypes.FACEBOOK_LOGIN_FAILURE: {
        return {
          ...state,
          loggedIn: false
        };
    }
    default: {
      return state;
    }
  }
}
