import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const SPOT_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.SPOT;

export class InvalidSpotContent extends SpotError {
  constructor(statusCode: number = 500) {
    super(SPOT_ERROR_MESSAGES.INVALID_SPOT_CONTENT, statusCode);
    this.name = "InvalidSpotContent";
  }
}

export class InvalidSpotLength extends SpotError {
    constructor(statusCode: number = 500, minLength: number, maxLength: number) {
      super(SPOT_ERROR_MESSAGES.INVALID_SPOT_LENGTH, statusCode);
      this.name = "InvalidSpotLength";
      this.body = { min: minLength, max: maxLength }
    }
}

export class InvalidSpotProfanity extends SpotError {
  constructor(statusCode: number = 500, profane: string) {
    super(SPOT_ERROR_MESSAGES.INVALID_SPOT_PROFANITY, statusCode);
    this.name = "InvalidSpotProfanity";
    this.body = { word: profane };
  }
}

export class InvalidSpotLineLength extends SpotError {
  constructor(statusCode: number = 500, maxLength: number) {
    super(SPOT_ERROR_MESSAGES.INVALID_SPOT_LINE_LENGTH, statusCode);
    this.name = "InvalidSpotLineLength";
    this.body = { max: maxLength }
  }
}

export class NoSpotContent extends SpotError {
    constructor(statusCode: number = 500) {
      super(SPOT_ERROR_MESSAGES.NO_CONTENT, statusCode);
      this.name = "NoSpotContent";
    }
}

export class SpotImage extends SpotError {
  constructor(statusCode: number) {
    super(SPOT_ERROR_MESSAGES.IMAGE, statusCode);
    this.name = "SpotImage";
  }
}

export class SpotActivity extends SpotError {
  constructor(statusCode: number = 500) {
    super(SPOT_ERROR_MESSAGES.SPOT_ACTIVITY, statusCode);
    this.name = "SpotActivity";
  }
}

export class GetSpot extends SpotError {
  constructor(statusCode: number = 500) {
    super(SPOT_ERROR_MESSAGES.GET_SPOT, statusCode);
    this.name = "GetSpot";
  }
}

export class GetSingleSpot extends SpotError {
  constructor(statusCode: number = 500) {
    super(SPOT_ERROR_MESSAGES.GET_SINGLE_SPOT, statusCode);
    this.name = "GetSingleSpot";
  }
}

export class DeleteSpot extends SpotError {
  constructor(statusCode: number = 500) {
    super(SPOT_ERROR_MESSAGES.DELETE_SPOT, statusCode);
    this.name = "DeleteSpot";
  }
}

export class RateSpot extends SpotError {
  constructor(statusCode: number = 500) {
    super(SPOT_ERROR_MESSAGES.RATE_SPOT, statusCode);
    this.name = "RateSpot";
  }
}

export class DeleteRatingSpot extends SpotError {
  constructor(statusCode: number = 500) {
    super(SPOT_ERROR_MESSAGES.DELETE_RATING_SPOT, statusCode);
    this.name = "DeleteRatingSpot";
  }
}

export class CreateSpot extends SpotError {
  constructor(statusCode: number = 500) {
    super(SPOT_ERROR_MESSAGES.CREATE_SPOT, statusCode);
    this.name = "CreateSpot";
  }
}