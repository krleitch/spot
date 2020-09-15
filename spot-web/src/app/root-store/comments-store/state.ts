import { SpotError } from '@exceptions/error';

// The id on all is the post id

export interface State {
    comments: any;
    replies: any;
    addCommentError: { error: SpotError, id: string };
    addCommentSuccess: { success: boolean, id: string };
    addReplyError: { error: SpotError, id: string };
    addReplySuccess: { success: boolean, id: string };
    addReply2Error: { error: SpotError, id: string };
    addReply2Success: { success: boolean, id: string };
}

export const initialState: State = (
  {
    addCommentError: { error: null, id: null },
    addCommentSuccess: { success: null, id: null },
    addReplyError: { error: null, id: null },
    addReplySuccess: { success: null, id: null },
    addReply2Error: { error: null, id: null },
    addReply2Success: { success: null, id: null },
    comments: {},
    replies: {},
  }
);
