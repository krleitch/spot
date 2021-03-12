import { Actions, ActionTypes } from './actions/actions';
import { FacebookActions, FacebookActionTypes } from './actions/facebook.actions';
import { GoogleActions, GoogleActionTypes } from './actions/google.actions';
import { initialState, State } from './state';

export function featureReducer(state = initialState, action: Actions | FacebookActions | GoogleActions): State {
  switch (action.type) {
    case ActionTypes.RESET_STORE: {
      return {
        ...initialState
      };
    }
    case ActionTypes.REGISTER_SUCCESS: {
      return {
        ...state,
        account: action.response.account,
        authenticationError: null,
        facebookConnected: action.response.account.facebook_id ? true : false,
        googleConnected: action.response.account.google_id ? true : false,
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
      return {
        ...state,
        account: action.response.account,
        authenticationError: null,
        facebookConnected: action.response.account.facebook_id ? true : false,
        googleConnected: action.response.account.google_id ? true : false,
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
        location: action.request.location,
        locationTimeReceived: new Date()
      };
    }
    case ActionTypes.LOCATION_FAILURE: {
      return {
        ...state,
        locationFailure: action.request.error,
        loadingLocation: false,
        location: null,
        locationTimeReceived: null
      };
    }
    case ActionTypes.ACCOUNT_REQUEST: {
      return {
        ...state,
        accountLoading: true,
      };
    }
    case ActionTypes.ACCOUNT_SUCCESS: {
      return {
        ...state,
        account: action.response.account,
        accountLoading: false,
        facebookConnected: action.response.account.facebook_id ? true : false,
        googleConnected: action.response.account.google_id ? true : false,
      };
    }
    case ActionTypes.UPDATE_USERNAME_REQUEST: {
      return {
        ...state,
        account: { ...state.account, username: action.request.username }
      };
    }
    case ActionTypes.UPDATE_EMAIL_REQUEST: {
      return {
        ...state,
        account: { ...state.account, email: action.request.email }
      };
    }
    case ActionTypes.UPDATE_PHONE_REQUEST: {
      return {
        ...state,
        account: { ...state.account, phone: action.request.phone }
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
    case ActionTypes.VERIFY_CONFIRM_REQUEST: {
      return {
        ...state,
        account: { ...state.account, verified_date: action.request.verified_date }
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
    case GoogleActionTypes.GOOGLE_CONNECT_SUCCESS: {
      return {
        ...state,
        googleConnected: true
      };
    }
    case GoogleActionTypes.GOOGLE_DISCONNECT_SUCCESS: {
      return {
        ...state,
        googleConnected: false
      };
    }
    default: {
      return state;
    }
  }
}
