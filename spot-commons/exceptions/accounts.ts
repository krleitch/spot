import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const ACCOUNTS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.ACCOUNTS;

export class DeleteAccount extends SpotError {
  constructor(statusCode) {
    super(ACCOUNTS_ERROR_MESSAGES.DELETE_ACCOUNT, statusCode);
    this.name = "DeleteAccount";
  }
}
