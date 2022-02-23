import { ActionTypes, Actions } from './actions/actions';
import {
  FacebookActionTypes,
  FacebookActions
} from './actions/facebook.actions';
import { GoogleActionTypes, GoogleActions } from './actions/google.actions';
import { State, initialState } from './state';

export function featureReducer(
  state = initialState,
  action: Actions | FacebookActions | GoogleActions
): State {
  switch (action.type) {
    case ActionTypes.RESET_STORE: {
      return {
        ...initialState
      };
    }
    case ActionTypes.REGISTER_SUCCESS: {
      return {
        ...state,
        user: action.response.user,
        authenticationError: null,
        authenticationSuccess: true
      };
    }
    case ActionTypes.REGISTER_FAILURE: {
      return {
        ...state,
        user: null,
        authenticationError: action.error,
        authenticationSuccess: false
      };
    }
    case ActionTypes.LOGIN_SUCCESS: {
      return {
        ...state,
        user: action.response.user,
        authenticationError: null,
        authenticationSuccess: true
      };
    }
    case ActionTypes.LOGIN_FAILURE: {
      return {
        ...state,
        user: null,
        authenticationError: action.error,
        authenticationSuccess: false
      };
    }
    case ActionTypes.LOGOUT_REQUEST: {
      return {
        ...state,
        user: null
      };
    }
    case ActionTypes.DELETE_SUCCESS: {
      return {
        ...state,
        user: null
      };
    }
    case ActionTypes.LOAD_LOCATION: {
      return {
        ...state,
        loadingLocation: true,
        locationFailure: null,
        location: null,
        locationTimeReceived: null
      };
    }
    case ActionTypes.SET_LOCATION: {
      return {
        ...state,
        loadingLocation: false,
        location: action.request.location,
        locationTimeReceived: new Date(),
        locationFailure: null
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
    case ActionTypes.USER_REQUEST: {
      return {
        ...state,
        userLoading: true
      };
    }
    case ActionTypes.USER_SUCCESS: {
      return {
        ...state,
        user: action.response.user,
        userLoading: false
      };
    }
    case ActionTypes.UPDATE_USERNAME_REQUEST: {
      return {
        ...state,
        user: { ...state.user, username: action.request.username }
      };
    }
    case ActionTypes.UPDATE_EMAIL_REQUEST: {
      return {
        ...state,
        user: {
          ...state.user,
          email: action.request.email,
          verifiedAt: null
        }
      };
    }
    case ActionTypes.UPDATE_PHONE_REQUEST: {
      return {
        ...state,
        user: { ...state.user, phone: action.request.phone }
      };
    }
    case ActionTypes.GET_METADATA_SUCCESS: {
      return {
        ...state,
        userMetadata: action.response.metadata
      };
    }
    case ActionTypes.UPDATE_METADATA_SUCCESS: {
      return {
        ...state,
        userMetadata: action.response.metadata
      };
    }
    case ActionTypes.VERIFY_CONFIRM_REQUEST: {
      return {
        ...state,
        user: {
          ...state.user,
          verifiedAt: action.request.user.verifiedAt
        }
      };
    }
    case FacebookActionTypes.FACEBOOK_LOGIN_SUCCESS: {
      return {
        ...state,
        user: action.response.user
      };
    }
    case FacebookActionTypes.FACEBOOK_CONNECT_SUCCESS: {
      return {
        ...state,
        user: action.response.user
      };
    }
    case FacebookActionTypes.FACEBOOK_DISCONNECT_SUCCESS: {
      return {
        ...state,
        user: { ...state.user, facebookId: null }
      };
    }
    case GoogleActionTypes.GOOGLE_LOGIN_SUCCESS: {
      return {
        ...state,
        user: action.response.user
      };
    }
    case GoogleActionTypes.GOOGLE_CONNECT_SUCCESS: {
      return {
        ...state,
        user: action.response.user
      };
    }
    case GoogleActionTypes.GOOGLE_DISCONNECT_SUCCESS: {
      return {
        ...state,
        user: { ...state.user, googleId: null }
      };
    }
    default: {
      return state;
    }
  }
}
