import { Actions, ActionTypes } from './actions/actions';
import { FacebookActions, FacebookActionTypes } from './actions/facebook.actions';
import { GoogleActions, GoogleActionTypes } from './actions/google.actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions | FacebookActions | GoogleActions): State {
  switch (action.type) {
    case ActionTypes.REGISTER_SUCCESS: {
      return {
        ...state,
        account: action.response.account,
        authenticationError: null,
      };
    }
    case ActionTypes.REGISTER_FAILURE: {
      return {
        ...state,
        account: null,
        authenticationError: action.error,
      };
    }
    case ActionTypes.LOGIN_SUCCESS: {

      if ( action.response.account.facebook_id ) {
          state.facebookConnected = true;
      }
      return {
        ...state,
        account: action.response.account,
        authenticationError: null
      };
    }
    case ActionTypes.LOGIN_FAILURE: {
      return {
        ...state,
        account: null,
        authenticationError: action.error
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
    case ActionTypes.LOAD_LOCATION: {
      return {
        ...state,
        loadingLocation: true
      };
    }
    case ActionTypes.SET_LOCATION: {
      return {
        ...state,
        loadingLocation: false,
        location: action.request.location
      };
    }
    case ActionTypes.LOCATION_FAILURE: {
      return {
        ...state,
        loadingLocation: false,
        location: null
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
    case ActionTypes.UPDATE_USERNAME_REQUEST: {
      return {
        ...state,
        usernameSuccess: false
      };
    }
    case ActionTypes.UPDATE_USERNAME_SUCCESS: {
      return {
        ...state,
        account: action.response.account,
        usernameSuccess: true
      };
    }
    case ActionTypes.UPDATE_USERNAME_FAILURE: {
      return {
        ...state,
        usernameError: action.error,
        usernameSuccess: false
      };
    }
    case ActionTypes.GET_METADATA_SUCCESS: {
      return {
        ...state,
        accountMetadata: action.response.metadata
      };
    }
    case ActionTypes.UPDATE_METADATA_SUCCESS: {
      return {
        ...state,
        accountMetadata: action.response.metadata
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
    case FacebookActionTypes.FACEBOOK_DISCONNECT_SUCCESS: {
      return {
        ...state,
        facebookConnected: false
      };
    }
    case GoogleActionTypes.GOOGLE_LOGIN_SUCCESS: {
      return {
        ...state,
        account: action.response.account,
        googleConnected: true
      };
    }
    default: {
      return state;
    }
  }
}
