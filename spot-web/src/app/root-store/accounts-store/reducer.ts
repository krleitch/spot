import { Actions, ActionTypes } from './actions/actions';
import { FacebookActions, FacebookActionTypes } from './actions/facebook.actions';
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

      console.log(action.error);

      return {
        ...state,
        account: null,
        authError: action.error,
      };
    }
    case ActionTypes.LOGIN_SUCCESS: {

      if ( action.response.account.facebook_id ) {
          state.facebookConnected = true;
      }

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

      if ( action.response.account.facebook_id ) {
        state.facebookConnected = true;
      }

      return {
        ...state,
        account: action.response.account
      };
    }
    case ActionTypes.UPDATE_USERNAME_SUCCESS: {
      return {
        ...state,
        account: action.response.account
      };
    }
    case FacebookActionTypes.FACEBOOK_LOGIN_SUCCESS: {
      return {
        ...state,
        account: action.response.account,
        facebookConnected: true
      };
    }
    case FacebookActionTypes.FACEBOOK_CONNECT_SUCCESS: {
      return {
        ...state,
        facebookConnected: true
      };
    }
    default: {
      return state;
    }
  }
}
