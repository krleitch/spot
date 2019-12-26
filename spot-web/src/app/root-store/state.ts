import { PostsStoreState } from './posts-store';
import { AccountsStoreState } from './accounts-store';
import { CommentsStoreState } from './comments-store';

export interface State {
  posts: PostsStoreState.State;
  accounts: AccountsStoreState.State;
  comments: CommentsStoreState.State;
}
