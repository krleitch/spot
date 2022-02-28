import { Spot } from '@models/../newModels/spot';
export interface State {
  spots: Spot[];
}

export const initialState: State = {
  spots: []
};
