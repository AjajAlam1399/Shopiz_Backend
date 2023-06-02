class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, constructor); // it will going to track our error
  }
}

module.exports = ErrorHandler;
