import { SpotError } from './error';
export declare class AddComment extends SpotError {
    constructor(statusCode: number);
}
export declare class InvalidCommentContent extends SpotError {
    constructor(statusCode: number);
}
export declare class InvalidCommentLength extends SpotError {
    constructor(statusCode: number, minLength: number, maxLength: number);
}
export declare class InvalidCommentProfanity extends SpotError {
    constructor(statusCode: number);
}
export declare class CommentImage extends SpotError {
    constructor(statusCode: number);
}
export declare class InvalidCommentLineLength extends SpotError {
    constructor(statusCode: number, maxLength: number);
}
export declare class NoCommentContent extends SpotError {
    constructor(statusCode: number);
}
export declare class CommentActivity extends SpotError {
    constructor(statusCode: number);
}
export declare class GetComments extends SpotError {
    constructor(statusCode: number);
}
export declare class GetReplies extends SpotError {
    constructor(statusCode: number);
}
export declare class DeleteComment extends SpotError {
    constructor(statusCode: number);
}
export declare class DeleteReply extends SpotError {
    constructor(statusCode: number);
}
export declare class LikeComment extends SpotError {
    constructor(statusCode: number);
}
export declare class UnratedComment extends SpotError {
    constructor(statusCode: number);
}
export declare class DislikeComment extends SpotError {
    constructor(statusCode: number);
}
export declare class LikeReply extends SpotError {
    constructor(statusCode: number);
}
export declare class DislikeReply extends SpotError {
    constructor(statusCode: number);
}
export declare class UnratedReply extends SpotError {
    constructor(statusCode: number);
}
export declare class ReportComment extends SpotError {
    constructor(statusCode: number);
}
export declare class NotTagged extends SpotError {
    constructor(statusCode: number);
}
export declare class NotInRange extends SpotError {
    constructor(statusCode: number);
}
