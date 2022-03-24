import { Action } from '@ngrx/store';

import { SpotError } from '@exceptions/error';

export enum ActionTypes {
  RESET_STORE = '[Spot] Reset Store',
  GENERIC_FAILURE = '[Spot] Generic Failure'
}

export class ResetStoreAction implements Action {
  readonly type = ActionTypes.RESET_STORE;
  constructor() {}
}

export class GenericFailureAction implements Action {
  readonly type = ActionTypes.GENERIC_FAILURE;
  constructor(public error: SpotError) {}
}

export type Actions = GenericFailureAction | ResetStoreAction;
