import { SpotError } from '@exceptions/error';

// The id on all is the post id

export interface State {
    comments: any;
    replies: any;
    addReply2Error: { error: SpotError, id: string };
    addReply2Success: { success: boolean, id: string };
}

export const initialState: State = (
  {
    addReply2Error: { error: null, id: null },
    addReply2Success: { success: null, id: null },
    comments: {},
    replies: {},
  }
);
