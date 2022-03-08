import {
  MemoizedSelector,
  createFeatureSelector,
  createSelector
} from '@ngrx/store';
import { Spot } from '@models/spot';

import { State } from './state';

export const selectSpotsFromStore = (state: State): Spot[] => state.spots;

export const selectSpotsState: MemoizedSelector<object, State> =
  createFeatureSelector<State>('spot');

export const selectSpots: MemoizedSelector<object, Spot[]> = createSelector(
  selectSpotsState,
  selectSpotsFromStore
);
