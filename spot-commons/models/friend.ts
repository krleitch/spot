export interface Friend {
  friendId: string; // Id of the relationship, not a user
  username: string | null;
  profilePictureSrc: string | null;
  createdAt: Date;
  confirmedAt: Date | null;
}

// Get
export interface GetFriendsRequest {
  limit: number;
  after?: string;
  before?: string;
}
export interface GetFriendsResponse {
  friends: Friend[];
  cursor: {
    before: string | undefined;
    after: string | undefined;
  };
}
// Friend Requests, confirmedAt NULL that you RECEIVED
export interface GetFriendRequestsRequest {}
export interface GetFriendRequestsResponse {
  friendRequests: Friend[];
}
// Pending Friends, confirmedAt NULL that you SENT
export interface GetPendingFriendsRequest {}
export interface GetPendingFriendsResponse {
  pendingFriends: Friend[];
}

// Delete
export interface DeleteFriendRequest {
  friendId: string; // this is the relationship id, not the user
}
export interface DeleteFriendResponse {}
export interface DeletePendingFriendRequest {
  friendId: string; // this is the relationship id, not the user
}
export interface DeletePendingFriendResponse {}

// Add
export interface CreateFriendRequest {
  username: string;
}
export interface CreateFriendResponse {
  friend: Friend; // This could be a confimed friend, if you try adding someone who sent a request
}
export interface AcceptFriendRequest {
  friendRequestId: string;
}
export interface AcceptFriendResponse {
  friend: Friend;
}
// Decline friend request
export interface DeclineFriendRequest {
  friendRequestId: string;
}
export interface DeclineFriendResponse {}
// Add to store
export interface AddFriendToStore {
  friend: Friend;
}
