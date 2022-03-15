
import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const USER_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.USER;

export class DeleteUser extends SpotError {
  constructor(statusCode: number = 500) {
    super(USER_ERROR_MESSAGES.DELETE_USER, statusCode);
    this.name = "DeleteUser";
  }
}

export class GetUser extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.GET_USER, statusCode);
      this.name = "GetUser";
    }
}

export class UpdateUsername extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.UPDATE_USERNAME, statusCode);
      this.name = "UpdateUsername";
    }
}

export class UpdateUsernameTimeout extends SpotError {
  constructor(statusCode: number = 500) {
    super(USER_ERROR_MESSAGES.UPDATE_USERNAME_TIMEOUT, statusCode);
    this.name = "UpdateUsernameTimeout";
  }
}

export class UpdateEmail extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.UPDATE_EMAIL, statusCode);
      this.name = "UpdateEmail";
    }
}

export class UpdateEmailTimeout extends SpotError {
  constructor(statusCode: number = 500) {
    super(USER_ERROR_MESSAGES.UPDATE_EMAIL_TIMEOUT, statusCode);
    this.name = "UpdateEmailTimeout";
  }
}

export class UpdatePhone extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.UPDATE_PHONE, statusCode);
      this.name = "UpdatePhone";
    }
}

export class UpdatePhoneTimeout extends SpotError {
  constructor(statusCode: number = 500) {
    super(USER_ERROR_MESSAGES.UPDATE_PHONE_TIMEOUT, statusCode);
    this.name = "UpdatePhoneTimeout";
  }
}

export class FacebookConnect extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.FACEBOOK_CONNECT, statusCode);
      this.name = "FacebookConnect";
    }
}

export class FacebookConnectExists extends SpotError {
  constructor(statusCode: number = 500) {
    super(USER_ERROR_MESSAGES.FACEBOOK_CONNECT_EXISTS, statusCode);
    this.name = "FacebookConnectExists";
  }
}

export class FacebookDisconnect extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.FACEBOOK_DISCONNECT, statusCode);
      this.name = "FacebookDisconnect";
    }
}

export class GoogleConnect extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.GOOGLE_CONNECT, statusCode);
      this.name = "GoogleConnect";
    }
}

export class GoogleConnectExists extends SpotError {
  constructor(statusCode: number = 500) {
    super(USER_ERROR_MESSAGES.GOOGLE_CONNECT_EXISTS, statusCode);
    this.name = "GoogleConnectExists";
  }
}

export class GoogleDisconnect extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.GOOGLE_DISCONNECT, statusCode);
      this.name = "GoogleDisconnect";
    }
}

export class GetMetadata extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.GET_METADATA, statusCode);
      this.name = "GetMetadata";
    }
}

export class MetadataUnitSystem extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.METADATA_UNIT_SYSTEM, statusCode);
      this.name = "MetadataUnitSystem";
    }
}

export class MetadataSearchType extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.METADATA_SEARCH_TYPE, statusCode);
      this.name = "MetadataSearchType";
    }
}

export class MetadataLocationType extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.METADATA_LOCATION_TYPE, statusCode);
      this.name = "MetadataLocationType";
    }
}

export class MetadataMatureFilter extends SpotError {
  constructor(statusCode: number = 500) {
    super(USER_ERROR_MESSAGES.METADATA_MATURE_FILTER, statusCode);
    this.name = "MetadataMatureFilter";
  }
}
export class MetadataThemeWeb extends SpotError {
  constructor(statusCode: number = 500) {
    super(USER_ERROR_MESSAGES.METADATA_THEME_WEB, statusCode);
    this.name = "MetadataThemeWeb";
  }
}

export class SendVerify extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.SEND_VERIFY, statusCode);
      this.name = "SendVerify";
    }
}

export class ConfirmVerify extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.CONFIRM_VERIFY, statusCode);
      this.name = "ConfirmVerify";
    }
}

export class CreateProfilePhoto extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.CREATE_PROFILE_PHOTO, statusCode);
      this.name = "CreateProfilePhoto";
    }
}
export class DeleteProfilePhoto extends SpotError {
    constructor(statusCode: number = 500) {
      super(USER_ERROR_MESSAGES.DELETE_PROFILE_PHOTO, statusCode);
      this.name = "DeleteProfilePhoto";
    }
}