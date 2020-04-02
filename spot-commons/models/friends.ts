// Friends
export interface Friend {
    username: string;
    creation_date: string;
}

// Friend Requests
export interface FriendRequest {
    username: string;
    creation_date: string;
}

export interface GetFriendRequestsRequest {

}

export interface GetFriendRequestsSuccess {
    friendRequests: FriendRequest[];
}

export interface AddFriendRequestsRequest {
    username: string;
}

export interface AddFriendRequestsSuccess {
    friendRequest: FriendRequest;
}
