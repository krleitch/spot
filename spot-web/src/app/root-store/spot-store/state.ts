import { Spot } from '@models/../newModels/spot';
import { SpotError } from '@exceptions/error';

export interface State {
  spots: Spot[];
  loading: boolean;
  createError: SpotError;
  createSuccess: boolean;
  noSpots: boolean; // Were any spots loaded flag
}

export const initialState: State = {
  spots: [],
  loading: false,
  createError: null,
  createSuccess: false,
  noSpots: false
};
