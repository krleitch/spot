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
    case ActionTypes.SET_SPOT_STORE_REQUEST: {
      if (action.request.initialLoad) {
        return {
          ...state,
          spots: action.request.spots
        };
      } else {
        // only need to concat if we have spots
        if (action.request.spots.length === 0) {
          return {
            ...state
          };
        } else {
          return {
            ...state,
            spots: state.spots.concat(action.request.spots)
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
    case ActionTypes.ADD_SPOT_STORE_REQUEST: {
      const newSpots = Array.from(state.spots);
      newSpots.unshift(action.request.spot);
      return {
        ...state,
        spots: newSpots
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
