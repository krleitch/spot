// Friends
export interface Friend {
    username: string;
    creation_date: string;
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
    
}

export interface DeclineFriendRequestsRequest {
    friendRequestId: string;
}

export interface DeclineFriendRequestsSuccess {
    
}