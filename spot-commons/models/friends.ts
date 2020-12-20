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

// Friend Requests
export interface FriendRequest {
    id: string;
    username: string;
    creation_date: string;
}

// get
export interface GetFriendRequests {

}

export interface GetFriendRequestsSuccess {
    friendRequests: FriendRequest[];
}

// add
export interface AddFriendRequest {
    username: string;
}

export interface AddFriendRequestSuccess {
    friendRequest: FriendRequest;
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

// delete - unused
export interface DeleteFriendRequests {
    friendRequestId: string;
}

export interface DeleteFriendRequestsSuccess {
    
}
