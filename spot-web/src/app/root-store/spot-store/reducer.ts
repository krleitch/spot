import { ActionTypes, Actions } from './actions';
import { State, initialState } from './state';
import { SpotRatingType } from '@models/../newModels/spot';

export function featureReducer(state = initialState, action: Actions): State {
  switch (action.type) {
    case ActionTypes.RESET_STORE: {
      return {
        ...initialState
      };
    }
    case ActionTypes.GET_REQUEST: {
      return {
        ...state,
        spots: action.request.initialLoad ? [] : state.spots,
        loading: true,
        noSpots: false
      };
    }
    case ActionTypes.GET_SUCCESS: {
      if (action.response.initialLoad) {
        return {
          ...state,
          spots: action.response.spots,
          loading: false,
          noSpots: action.response.spots.length === 0
        };
      } else {
        // only need to concat if we have spots
        if (action.response.spots.length === 0) {
          return {
            ...state,
            loading: false,
            noSpots: true
          };
        } else {
          return {
            ...state,
            spots: state.spots.concat(action.response.spots),
            loading: false,
            noSpots: false
          };
        }
      }
    }
    case ActionTypes.CREATE_COMMENT: {
      // When you add a comment, add 1 to the spot comments counter
      const newSpots = Array.from(state.spots);
      state.spots.forEach((spot, i) => {
        if (spot.spotId === action.request.spotId) {
          const newObj = Object.assign({}, spot);
          newObj.totalComments += 1;
          newSpots[i] = newObj;
        }
      });
      return {
        ...state,
        spots: newSpots
      };
    }
    case ActionTypes.DELETE_COMMENT: {
      // When you delete a comment, remove 1 to the spot comments counter
      const newSpots = Array.from(state.spots);
      state.spots.forEach((spot, i) => {
        if (spot.spotId === action.request.spotId) {
          const newObj = Object.assign({}, spot);
          newObj.totalComments -= 1;
          newSpots[i] = newObj;
        }
      });
      return {
        ...state,
        spots: newSpots
      };
    }
    case ActionTypes.CREATE_REQUEST: {
      return {
        ...state,
        createSuccess: false
      };
    }
    case ActionTypes.CREATE_SUCCESS: {
      const newSpots = Array.from(state.spots);

      newSpots.unshift(action.response.spot);
      return {
        ...state,
        createSuccess: true,
        spots: newSpots
      };
    }
    case ActionTypes.CREATE_FAILURE: {
      return {
        ...state,
        createError: action.error,
        createSuccess: false
      };
    }
    case ActionTypes.RATE_SUCCESS: {
      const newSpots = Array.from(state.spots);

      state.spots.forEach((spot, i) => {
        if (spot.spotId === action.response.spotId) {
          const newObj = Object.assign({}, spot);
          // add new rating
          if (action.response.rating === SpotRatingType.LIKE) {
            newObj.likes += 1;
          }
          if (action.response.rating === SpotRatingType.DISLIKE) {
            newObj.dislikes += 1;
          }
          // remove the old rating
          if (
            spot.myRating === SpotRatingType.DISLIKE &&
            action.response.rating !== SpotRatingType.DISLIKE
          ) {
            newObj.dislikes -= 1;
          }
          if (
            spot.myRating === SpotRatingType.LIKE &&
            action.response.rating !== SpotRatingType.LIKE
          ) {
            newObj.likes -= 1;
          }
          newObj.myRating = action.response.rating;
          newSpots[i] = newObj;
        }
      });
      return {
        ...state,
        spots: newSpots
      };
    }
    case ActionTypes.DELETE_RATING_SUCCESS: {
      const newSpots = Array.from(state.spots);

      state.spots.forEach((spot, i) => {
        if (spot.spotId === action.response.spotId) {
          const newObj = Object.assign({}, spot);
          if (spot.myRating === SpotRatingType.LIKE) {
            newObj.likes -= 1;
          } else if (spot.myRating === SpotRatingType.DISLIKE) {
            newObj.dislikes -= 1;
          }
          newObj.myRating = SpotRatingType.NONE;
          newSpots[i] = newObj;
        }
      });
      return {
        ...state,
        spots: newSpots
      };
    }
    case ActionTypes.DELETE_SUCCESS: {
      const newSpots = Array.from(state.spots);

      state.spots.forEach((spot, i) => {
        if (spot.spotId === action.response.spotId) {
          newSpots.splice(i, 1);
        }
      });
      return {
        ...state,
        spots: newSpots
      };
    }
    default: {
      return state;
    }
  }
}
