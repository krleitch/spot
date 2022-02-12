import { SpotError } from './error';
export declare class GetNotifications extends SpotError {
    constructor(statusCode: number);
}
export declare class GetUnreadNotifications extends SpotError {
    constructor(statusCode: number);
}
export declare class SendNotification extends SpotError {
    constructor(statusCode: number);
}
export declare class SeenNotification extends SpotError {
    constructor(statusCode: number);
}
export declare class SeenAllNotification extends SpotError {
    constructor(statusCode: number);
}
export declare class DeleteNotification extends SpotError {
    constructor(statusCode: number);
}
export declare class DeleteAllNotification extends SpotError {
    constructor(statusCode: number);
}
