import {
  MemoizedSelector,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';
import { Spot } from '@models/../newModels/spot';
import { SpotError } from '@exceptions/error';

import { State } from './state';

export const selectSpotsFromStore = (state: State): Spot[] => state.spots;
export const selectLoadingFromStore = (state: State): boolean => state.loading;
export const selectCreateSpotErrorFromStore = (state: State): SpotError =>
  state.createError;
export const selectCreateSpotSuccessFromStore = (state: State): boolean =>
  state.createSuccess;
export const selectNoSpotsFromStore = (state: State): boolean => state.noSpots;

export const selectSpotsState: MemoizedSelector<object, State> =
  createFeatureSelector<State>('spot');

export const selectSpots: MemoizedSelector<object, Spot[]> = createSelector(
  selectSpotsState,
  selectSpotsFromStore
);

export const selectLoading: MemoizedSelector<object, boolean> = createSelector(
  selectSpotsState,
  selectLoadingFromStore
);

export const selectCreateSpotError: MemoizedSelector<object, SpotError> =
  createSelector(selectSpotsState, selectCreateSpotErrorFromStore);

export const selectCreateSpotSuccess: MemoizedSelector<object, boolean> =
  createSelector(selectSpotsState, selectCreateSpotSuccessFromStore);

export const selectNoSpots: MemoizedSelector<object, boolean> = createSelector(
  selectSpotsState,
  selectNoSpotsFromStore
);
