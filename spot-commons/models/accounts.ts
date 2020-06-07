export interface Account {
    id: number;
    email: string;
    username: string;
    password: string;
    phone: string;
    score: number;
    facebook_id: string;
}

// the location object associated with the account for the login
export interface Location {
    latitude: number;
    longitude: number;
}

export interface SetLocationRequest {
    location: Location
}

// update username
export interface UpdateUsernameRequest {
    username: string;
}

export interface UpdateUsernameResponse {
    account: Account;
}

// get account
export interface GetAccountRequest {

}

export interface GetAccountSuccess {
    account: Account;
}

// facebook

export interface FacebookConnectRequest {
    accessToken: string;
}

export interface FacebookConnectResponse {
    created: boolean;
}

export interface FacebookDisconnectRequest {

}

export interface FacebookDisconnectResponse {

}
