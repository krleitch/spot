import { SpotError } from './error';
import { ERROR_MESSAGES } from './messages';

const FRIENDS_ERROR_MESSAGES = ERROR_MESSAGES.MAIN.FRIENDS;

// If username doesnt exist or is yourself, or already added / requested
export class GetFriends extends SpotError {
  constructor(statusCode) {
    super(FRIENDS_ERROR_MESSAGES.GET_FRIENDS, statusCode);
    this.name = "GetFriends";
  }
}

export class GetFriendRequests extends SpotError {
  constructor(statusCode) {
    super(FRIENDS_ERROR_MESSAGES.GET_FRIEND_REQUESTS, statusCode);
    this.name = "GetFriendRrequests";
  }
}

export class GetPendingFriendRequests extends SpotError {
  constructor(statusCode) {
    super(FRIENDS_ERROR_MESSAGES.GET_PENDING_FRIEND_REQUESTS, statusCode);
    this.name = "GetPendingFriendRequests";
  }
}

// If username doesnt exist or is yourself, or already added / requested
export class UsernameError extends SpotError {
    constructor(message, statusCode) {
      super(message, statusCode);
      this.name = "UsernameError";
    }
}

// you are already friends with this person
// Note if you try to add someone who sent you a request, it will just add the person instead
export class FriendExistsError extends SpotError {
  constructor(statusCode) {
    super(FRIENDS_ERROR_MESSAGES.EXISTS, statusCode);
    this.name = "FriendExistsError";
  }
}

// You cannot add yourself
export class AddSelfError extends SpotError {
  constructor(statusCode) {
    super(FRIENDS_ERROR_MESSAGES.SELF, statusCode);
    this.name = "AddSelfError";
  }
}

// No account with that username
export class NoAccountError extends SpotError {
  constructor(statusCode) {
    super(FRIENDS_ERROR_MESSAGES.NO_USER, statusCode);
    this.name = "NoAccountError";
  }
}
