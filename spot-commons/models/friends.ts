// Friends
export interface Friend {
    id: string;
    username: string;
    creation_date: string;
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

// Friend Requests
export interface FriendRequest {
    id: string;
    username: string;
    creation_date: string;
}

// get
export interface GetFriendRequestsRequest {

}

export interface GetFriendRequestsSuccess {
    friendRequests: FriendRequest[];
}

// add
export interface AddFriendRequestsRequest {
    username: string;
}

export interface AddFriendRequestsSuccess {
    friendRequest: FriendRequest;
}

// delete
export interface DeleteFriendRequestsRequest {
    friendRequestId: string;
}

export interface DeleteFriendRequestsSuccess {
    
}

// accept / decline

export interface AcceptFriendRequestsRequest {
    friendRequestId: string;
}

export interface AcceptFriendRequestsSuccess {
    friendRequestId: string;
}

export interface DeclineFriendRequestsRequest {
    friendRequestId: string;
}

export interface DeclineFriendRequestsSuccess {
    friendRequestId: string;
}