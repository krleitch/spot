import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const NOTIFICATIONS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.NOTIFICATIONS;

export class GetNotifications extends SpotError {
  constructor(statusCode) {
    super(NOTIFICATIONS_ERROR_MESSAGES.GET_NOTIFICATIONS, statusCode);
    this.name = "GetNotifications";
  }
}
