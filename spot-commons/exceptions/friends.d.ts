import { SpotError } from './error';
export declare class GetFriends extends SpotError {
    constructor(statusCode: number);
}
export declare class GetFriendRequests extends SpotError {
    constructor(statusCode: number);
}
export declare class GetPendingFriendRequests extends SpotError {
    constructor(statusCode: number);
}
export declare class DeletePendingFriendRequest extends SpotError {
    constructor(statusCode: number);
}
export declare class UsernameError extends SpotError {
    constructor(message: string, statusCode: number);
}
export declare class FriendExistsError extends SpotError {
    constructor(statusCode: number);
}
export declare class AddSelfError extends SpotError {
    constructor(statusCode: number);
}
export declare class NoAccountError extends SpotError {
    constructor(statusCode: number);
}
export declare class DeleteFriend extends SpotError {
    constructor(statusCode: number);
}
export declare class AcceptFriendRequest extends SpotError {
    constructor(statusCode: number);
}
export declare class DeclineFriendRequest extends SpotError {
    constructor(statusCode: number);
}
