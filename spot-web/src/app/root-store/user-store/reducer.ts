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
    // User
    case ActionTypes.REGISTER_SUCCESS: {
      return {
        ...state,
        user: action.response.user,
        authenticationError: null
      };
    }
    case ActionTypes.REGISTER_FAILURE: {
      return {
        ...state,
        user: null,
        authenticationError: action.error
      };
    }
    case ActionTypes.LOGIN_SUCCESS: {
      return {
        ...state,
        user: action.response.user,
        authenticationError: null
      };
    }
    case ActionTypes.LOGIN_FAILURE: {
      return {
        ...state,
        user: null,
        authenticationError: action.error
      };
    }
    case ActionTypes.LOGOUT_USER: {
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
    case ActionTypes.GET_USER_REQUEST: {
      return {
        ...state,
        userLoading: true
      };
    }
    case ActionTypes.GET_USER_SUCCESS: {
      return {
        ...state,
        user: action.response.user,
        userLoading: false
      };
    }
    case ActionTypes.SET_USER: {
      return {
        ...state,
        user: {
          ...state.user,
          ...action.request.user
        }
      };
    }
    // Location
    case ActionTypes.SET_LOADING_LOCATION: {
      return {
        ...state,
        locationLoading: true,
        locationFailure: null,
        location: null,
        locationCreatedAt: null
      };
    }
    case ActionTypes.SET_LOCATION: {
      return {
        ...state,
        locationLoading: false,
        location: action.request.location,
        locationCreatedAt: new Date(),
        locationFailure: null
      };
    }
    case ActionTypes.SET_LOCATION_FAILURE: {
      return {
        ...state,
        locationFailure: action.request.error,
        locationLoading: false,
        location: null,
        locationCreatedAt: null
      };
    }
    // Metadata
    case ActionTypes.GET_METADATA_REQUEST: {
      return {
        ...state,
        userMetadataLoading: true
      };
    }
    case ActionTypes.GET_METADATA_SUCCESS: {
      return {
        ...state,
        userMetadata: action.response.metadata,
        userMetadataLoading: false
      };
    }
    case ActionTypes.GET_METADATA_FAILURE: {
      return {
        ...state,
        userMetadata: null,
        userMetadataLoading: false
      };
    }
    case ActionTypes.UPDATE_METADATA_SUCCESS: {
      return {
        ...state,
        userMetadata: action.response.metadata
      };
    }
    // Facebook
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
    // Google
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
