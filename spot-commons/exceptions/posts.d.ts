import { SpotError } from './error';
export declare class PostError extends SpotError {
    constructor(statusCode: number);
}
export declare class InvalidPostContent extends SpotError {
    constructor(statusCode: number);
}
export declare class InvalidPostLength extends SpotError {
    constructor(statusCode: number, minLength: number, maxLength: number);
}
export declare class InvalidPostProfanity extends SpotError {
    constructor(statusCode: number, profane: string);
}
export declare class InvalidPostLineLength extends SpotError {
    constructor(statusCode: number, maxLength: number);
}
export declare class NoPostContent extends SpotError {
    constructor(statusCode: number);
}
export declare class PostImage extends SpotError {
    constructor(statusCode: number);
}
export declare class PostActivity extends SpotError {
    constructor(statusCode: number);
}
export declare class GetPosts extends SpotError {
    constructor(statusCode: number);
}
export declare class GetSinglePost extends SpotError {
    constructor(statusCode: number);
}
export declare class DeletePost extends SpotError {
    constructor(statusCode: number);
}
export declare class DislikePost extends SpotError {
    constructor(statusCode: number);
}
export declare class LikePost extends SpotError {
    constructor(statusCode: number);
}
export declare class UnratedPost extends SpotError {
    constructor(statusCode: number);
}
