export interface Account {
    email: string;
    username: string;
    password: string;
    phone: string;
    score: number;
    facebook_id: string;
    google_id: string;
    verified_date: string;
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

export interface LoadLocationRequest {
    
}

export interface SetLocationRequest {
    location: Location
}

export interface LocationFailure {
    error: string;
}

// Verify account
export interface VerifyRequest {

}

export interface VerifyResponse {

}

export interface VerifyConfirmRequest {
    token: string;
}

export interface VerifyConfirmResponse {
    verified_date: string;
}

// update account info
export interface UpdateUsernameRequest {
    username: string;
}

export interface UpdateUsernameResponse {
    username: string;
}

export interface UpdateEmailRequest {
    email: string;
}

export interface UpdateEmailResponse {
    email: string;
}

export interface UpdatePhoneRequest {
    phone: string;
}

export interface UpdatePhoneResponse {
    phone: string;
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

// google

export interface GoogleConnectRequest {
    accessToken: string;
}

export interface GoogleConnectResponse {
    created: boolean;
}

export interface GoogleDisconnectRequest {

}

export interface GoogleDisconnectResponse {

}
