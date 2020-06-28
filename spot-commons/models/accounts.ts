export interface Account {
    id: number;
    email: string;
    username: string;
    password: string;
    phone: string;
    score: number;
    facebook_id: string;
}

export interface AccountMetadata {
    distance_unit: string;
    search_type: string;
    search_distance: string;
    score: number;
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

// Account metadata
export interface GetAccountMetadataRequest {

}

export interface GetAccountMetadataSuccess {
    metadata: AccountMetadata;
}

export interface UpdateAccountMetadataRequest {
    distance_unit?: string;
    search_type?: string;
    search_distance?: string;
}

export interface UpdateAccountMetadataSuccess {
    metadata: AccountMetadata;
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
