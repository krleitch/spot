import { Action } from '@ngrx/store';

export enum ActionTypes {
  RESET_STORE = '[Social] Reset Store',
}

export class ResetStoreAction implements Action {
  readonly type = ActionTypes.RESET_STORE;
  constructor() {}
}

export type Actions = ResetStoreAction;
