import { User } from './user.js';

interface Jwt {
  token: string,
  expiresIn: number // Number of days from now
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    phone: string;
};
export interface RegisterResponse {
    jwt: Jwt;
    user: User;
};
export interface LoginRequest {
    emailOrUsername: string;
    password: string;
};
export interface LoginResponse {
    jwt: Jwt;
    user: User;
};

// Facebook
export interface FacebookLoginRequest {
    accessToken: string;
}
export interface FacebookLoginResponse {
    created: boolean; // Was the account freshly created
    jwt: Jwt;
    user: User;
}

// Google
export interface GoogleLoginRequest {
    accessToken: string;
}
export interface GoogleLoginResponse {
    created: boolean; // Was the account freshly created
    jwt: Jwt;
    user: User;
}

// Password reset
export interface PasswordResetRequest {
    email: string;
}
export interface PasswordResetResponse {}
export interface ValidateTokenRequest {
    token: string;
    link: string;
}
export interface ValidateTokenResponse {}
export interface NewPasswordRequest {
    token: string;
    link: string;
    password: string;
}
export interface NewPasswordResponse {}
