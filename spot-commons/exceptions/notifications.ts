import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const NOTIFICATIONS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.NOTIFICATIONS;

export class GetNotifications extends SpotError {
    constructor(statusCode: number = 500) {
    super(NOTIFICATIONS_ERROR_MESSAGES.GET_NOTIFICATIONS, statusCode);
    this.name = "GetNotifications";
    }
}

export class GetUnreadNotifications extends SpotError {
    constructor(statusCode: number = 500) {
        super(NOTIFICATIONS_ERROR_MESSAGES.GET_UNREAD_NOTIFICATIONS, statusCode);
        this.name = "GetUnreadNotifications";
    }
}

export class SendNotification extends SpotError {
    constructor(statusCode: number = 500) {
        super(NOTIFICATIONS_ERROR_MESSAGES.SEND_NOTIFICATION, statusCode);
        this.name = "SendNotification";
    }
}

export class SeenNotification extends SpotError {
    constructor(statusCode: number = 500) {
        super(NOTIFICATIONS_ERROR_MESSAGES.SEEN_NOTIFICATION, statusCode);
        this.name = "SeenNotification";
    }
}

export class SeenAllNotification extends SpotError {
    constructor(statusCode: number = 500) {
        super(NOTIFICATIONS_ERROR_MESSAGES.SEEN_ALL_NOTIFICATION, statusCode);
        this.name = "SeenAllNotification";
    }
}

export class DeleteNotification extends SpotError {
    constructor(statusCode: number = 500) {
        super(NOTIFICATIONS_ERROR_MESSAGES.DELETE_NOTIFICATION, statusCode);
        this.name = "DeletelNotification";
    }
}

export class DeleteAllNotification extends SpotError {
    constructor(statusCode: number = 500) {
        super(NOTIFICATIONS_ERROR_MESSAGES.DELETE_ALL_NOTIFICATION, statusCode);
        this.name = "DeleteAllNotification";
    }
}
