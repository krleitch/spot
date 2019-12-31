// If email, username, or phone already used on an account
export class AccountExistsError extends Error {
    constructor(message) {
      super(message);
      this.name = "AccountExistsError";
    }
}

// If email, username, password, phone aren't valid
export class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ValidationError";
    }
}
