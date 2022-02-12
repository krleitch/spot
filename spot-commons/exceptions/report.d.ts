import { SpotError } from './error';
export declare class ReportError extends SpotError {
    constructor(statusCode: number);
}
export declare class ReportLengthError extends SpotError {
    constructor(statusCode: number, minLength: number, maxLength: number);
}
