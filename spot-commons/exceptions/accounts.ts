import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const ACCOUNTS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.ACCOUNTS;

export class DeleteAccount extends SpotError {
  constructor(statusCode) {
    super(ACCOUNTS_ERROR_MESSAGES.DELETE_ACCOUNT, statusCode);
    this.name = "DeleteAccount";
  }
}

export class GetAccount extends SpotError {
    constructor(statusCode) {
      super(ACCOUNTS_ERROR_MESSAGES.GET_ACCOUNT, statusCode);
      this.name = "GetAccount";
    }
}

export class UpdateUsername extends SpotError {
    constructor(statusCode) {
      super(ACCOUNTS_ERROR_MESSAGES.UPDATE_USERNAME, statusCode);
      this.name = "UpdateUsername";
    }
}

export class UpdateEmail extends SpotError {
    constructor(statusCode) {
      super(ACCOUNTS_ERROR_MESSAGES.UPDATE_EMAIL, statusCode);
      this.name = "UpdateEmail";
    }
}

export class UpdatePhone extends SpotError {
    constructor(statusCode) {
      super(ACCOUNTS_ERROR_MESSAGES.UPDATE_PHONE, statusCode);
      this.name = "UpdatePhone";
    }
}
