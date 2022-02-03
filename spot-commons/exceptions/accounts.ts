import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const ACCOUNTS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.ACCOUNTS;

export class DeleteAccount extends SpotError {
  constructor(statusCode: number) {
    super(ACCOUNTS_ERROR_MESSAGES.DELETE_ACCOUNT, statusCode);
    this.name = "DeleteAccount";
  }
}

export class GetAccount extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.GET_ACCOUNT, statusCode);
      this.name = "GetAccount";
    }
}

export class UpdateUsername extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.UPDATE_USERNAME, statusCode);
      this.name = "UpdateUsername";
    }
}

export class UpdateUsernameTimeout extends SpotError {
  constructor(statusCode: number) {
    super(ACCOUNTS_ERROR_MESSAGES.UPDATE_USERNAME_TIMEOUT, statusCode);
    this.name = "UpdateUsernameTimeout";
  }
}

export class UpdateEmail extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.UPDATE_EMAIL, statusCode);
      this.name = "UpdateEmail";
    }
}

export class UpdateEmailTimeout extends SpotError {
  constructor(statusCode: number) {
    super(ACCOUNTS_ERROR_MESSAGES.UPDATE_EMAIL_TIMEOUT, statusCode);
    this.name = "UpdateEmailTimeout";
  }
}

export class UpdatePhone extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.UPDATE_PHONE, statusCode);
      this.name = "UpdatePhone";
    }
}

export class UpdatePhoneTimeout extends SpotError {
  constructor(statusCode: number) {
    super(ACCOUNTS_ERROR_MESSAGES.UPDATE_PHONE_TIMEOUT, statusCode);
    this.name = "UpdatePhoneTimeout";
  }
}

export class FacebookConnect extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.FACEBOOK_CONNECT, statusCode);
      this.name = "FacebookConnect";
    }
}

export class FacebookConnectExists extends SpotError {
  constructor(statusCode: number) {
    super(ACCOUNTS_ERROR_MESSAGES.FACEBOOK_CONNECT_EXISTS, statusCode);
    this.name = "FacebookConnectExists";
  }
}

export class FacebookDisconnect extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.FACEBOOK_DISCONNECT, statusCode);
      this.name = "FacebookDisconnect";
    }
}

export class GoogleConnect extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.GOOGLE_CONNECT, statusCode);
      this.name = "GoogleConnect";
    }
}

export class GoogleDisconnect extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.GOOGLE_DISCONNECT, statusCode);
      this.name = "GoogleDisconnect";
    }
}

export class GetMetadata extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.GET_METADATA, statusCode);
      this.name = "GetMetadata";
    }
}

export class MetadataDistanceUnit extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.METADATA_DISTANCE_UNIT, statusCode);
      this.name = "MetadataDistanceUnit";
    }
}

export class MetadataSearchType extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.METADATA_SEARCH_TYPE, statusCode);
      this.name = "MetadataSearchType";
    }
}

export class MetadataSearchDistance extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.METADATA_SEARCH_DISTANCE, statusCode);
      this.name = "MetadataSearchDistance";
    }
}

export class MetadataMatureFilter extends SpotError {
  constructor(statusCode: number) {
    super(ACCOUNTS_ERROR_MESSAGES.METADATA_MATURE_FILTER, statusCode);
    this.name = "MetadataMatureFilter";
  }
}
export class MetadataThemeWeb extends SpotError {
  constructor(statusCode: number) {
    super(ACCOUNTS_ERROR_MESSAGES.METADATA_THEME_WEB, statusCode);
    this.name = "MetadataThemeWeb";
  }
}

export class SendVerify extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.SEND_VERIFY, statusCode);
      this.name = "SendVerify";
    }
}

export class ConfirmVerify extends SpotError {
    constructor(statusCode: number) {
      super(ACCOUNTS_ERROR_MESSAGES.CONFIRM_VERIFY, statusCode);
      this.name = "ConfirmVerify";
    }
}
