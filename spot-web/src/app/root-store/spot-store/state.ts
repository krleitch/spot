import { Spot } from '@models/spot';
export interface State {
  spots: Spot[];
}

export const initialState: State = {
  spots: []
};
