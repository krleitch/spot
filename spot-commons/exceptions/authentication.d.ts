import { SpotError } from './error';
export declare class AuthenticationError extends SpotError {
    constructor(statusCode: number);
}
export declare class VerifyError extends SpotError {
    constructor(statusCode: number);
}
export declare class Register extends SpotError {
    constructor(statusCode: number);
}
export declare class UsernameLengthError extends SpotError {
    constructor(statusCode: number, minLength: number, maxLength: number);
}
export declare class UsernameCharacterError extends SpotError {
    constructor(statusCode: number);
}
export declare class UsernameTakenError extends SpotError {
    constructor(statusCode: number);
}
export declare class PasswordLengthError extends SpotError {
    constructor(statusCode: number, minLength: number, maxLength: number);
}
export declare class EmailTakenError extends SpotError {
    constructor(statusCode: number);
}
export declare class EmailInvalidError extends SpotError {
    constructor(statusCode: number);
}
export declare class PhoneTakenError extends SpotError {
    constructor(statusCode: number);
}
export declare class PhoneInvalidError extends SpotError {
    constructor(statusCode: number);
}
export declare class UsernameOrPasswordError extends SpotError {
    constructor(statusCode: number);
}
export declare class PasswordReset extends SpotError {
    constructor(statusCode: number);
}
export declare class PasswordResetValidate extends SpotError {
    constructor(statusCode: number);
}
export declare class NewPassword extends SpotError {
    constructor(statusCode: number);
}
export declare class FacebookSignUpError extends SpotError {
    constructor(statusCode: number);
}
export declare class GoogleSignUpError extends SpotError {
    constructor(statusCode: number);
}
