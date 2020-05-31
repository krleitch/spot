// The generic spot error everything is based off of

export class SpotError extends Error {

    statusCode: string;
    status: string;

    constructor(message) {
      super(message);
    }
}
