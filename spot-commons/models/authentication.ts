import { Account } from './accounts';

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    phone: string;
};

export interface RegisterResponse {
    jwt: { token: string, expiresIn: string };
    account: Account
};

export interface LoginRequest {
    userOrEmail: string;
    password: string;
};

export interface LoginResponse {
    jwt: { token: string, expiresIn: string };
    account: Account
};
