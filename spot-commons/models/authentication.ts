import { Account } from './accounts';

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    phone: string;
};

export interface RegisterResponse {
    jwt: { token: string, expiresIn: string };
    account: Account;
};

export interface LoginRequest {
    emailOrUsername: string;
    password: string;
};

export interface LoginResponse {
    jwt: { token: string, expiresIn: string };
    account: Account;
};

// Facebook

export interface FacebookLoginRequest {
    accessToken: string;
}

export interface FacebookLoginResponse {
    created: boolean;
    account: Account;
}
