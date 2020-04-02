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
