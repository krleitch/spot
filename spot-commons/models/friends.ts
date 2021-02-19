// Friend
export interface Friend {
    id: string; // The id of the relationship, not the account id of the friend
    username: string;
    creation_date: string;
    confirmed_date: string;
}

// get
export interface GetFriendsRequest {
    limit: number;
    date: string;
}

export interface GetFriendsSuccess {
    friends: Friend[];
}

// delete
export interface DeleteFriendsRequest {
    friendId: string;
}

export interface DeleteFriendsSuccess {
    friendId: string;
}

// add to store
export interface AddFriendToStore {
    friend: Friend;
}

// Friend Requests, just have a confirmed_date of NULL

// get
export interface GetFriendRequests {

}

export interface GetFriendRequestsSuccess {
    friendRequests: Friend[];
}

// add
export interface AddFriendRequest {
    username: string;
}

export interface AddFriendRequestSuccess {
    friend: Friend; // check confirmed null to see if added on return
}

// accept friend request
export interface AcceptFriendRequest {
    friendRequestId: string;
}

export interface AcceptFriendRequestSuccess {
    friend: Friend;
}

// decline friend request
export interface DeclineFriendRequest {
    friendRequestId: string;
}

export interface DeclineFriendRequestSuccess {

}

// Pending

// get
export interface GetPendingFriendRequests {

}

export interface GetPendingFriendRequestsSuccess {
    friendRequests: Friend[];
}

// delete
export interface DeletePendingFriendRequest {
    friendRequestId: string;
}

export interface DeletePendingFriendSuccess {
    friendRequestId: string;
}
