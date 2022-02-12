import { SpotError } from './error';
export declare class DeleteAccount extends SpotError {
    constructor(statusCode: number);
}
export declare class GetAccount extends SpotError {
    constructor(statusCode: number);
}
export declare class UpdateUsername extends SpotError {
    constructor(statusCode: number);
}
export declare class UpdateUsernameTimeout extends SpotError {
    constructor(statusCode: number);
}
export declare class UpdateEmail extends SpotError {
    constructor(statusCode: number);
}
export declare class UpdateEmailTimeout extends SpotError {
    constructor(statusCode: number);
}
export declare class UpdatePhone extends SpotError {
    constructor(statusCode: number);
}
export declare class UpdatePhoneTimeout extends SpotError {
    constructor(statusCode: number);
}
export declare class FacebookConnect extends SpotError {
    constructor(statusCode: number);
}
export declare class FacebookConnectExists extends SpotError {
    constructor(statusCode: number);
}
export declare class FacebookDisconnect extends SpotError {
    constructor(statusCode: number);
}
export declare class GoogleConnect extends SpotError {
    constructor(statusCode: number);
}
export declare class GoogleDisconnect extends SpotError {
    constructor(statusCode: number);
}
export declare class GetMetadata extends SpotError {
    constructor(statusCode: number);
}
export declare class MetadataDistanceUnit extends SpotError {
    constructor(statusCode: number);
}
export declare class MetadataSearchType extends SpotError {
    constructor(statusCode: number);
}
export declare class MetadataSearchDistance extends SpotError {
    constructor(statusCode: number);
}
export declare class MetadataMatureFilter extends SpotError {
    constructor(statusCode: number);
}
export declare class MetadataThemeWeb extends SpotError {
    constructor(statusCode: number);
}
export declare class SendVerify extends SpotError {
    constructor(statusCode: number);
}
export declare class ConfirmVerify extends SpotError {
    constructor(statusCode: number);
}
