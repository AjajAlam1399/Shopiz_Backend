const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, resp, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "internal Server Error";

  // wrong mongodb id error
  if (err.name === "CastError") {
    const message = `Ressource not found , Invalid : ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // mongdb duplicate key error  --> this occur when we are creating users
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // wrong jwt token
  if (err.name === "JsonWebTokenError") {
    const message = `Json web token is invalid try agin`;
    err = new ErrorHandler(message, 400);
  }
  // jwt expire Error
  if (err.name === "TokenExpiredError") {
    const message = `Json web token has been isExpired try agin`;
    err = new ErrorHandler(message, 400);
  }

  resp.status(err.statusCode).json({
    sucess: false,
    error: err.message, // we can use err.stack to know the complete error
  });
};
