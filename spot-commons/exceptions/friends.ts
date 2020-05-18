// If email, username, password, phone aren't valid
export class UsernameError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.name = "UsernameError";
    //   this.statusCode = statusCode;
    //   this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    //   this.isOperational = true;
    }
}
