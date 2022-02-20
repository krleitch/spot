// The generic spot error everything is based off of

export class SpotError extends Error {

    statusCode: string; // 200, 400, 404, 500
    status: string; // Fail or Error 4 / ?
    // name: string; // Used for reference, make sure same as class name
    body: any; // contains any additional details about the error

    constructor(message: string, statusCode: number = 500) {
      super(message);
      this.statusCode = statusCode.toString();
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    }
}
