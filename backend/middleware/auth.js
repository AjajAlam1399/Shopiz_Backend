const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/Usermodels");

exports.isAuthenticatedUser = catchAsyncError(async (reqs, resp, next) => {
  const { token } = reqs.cookies;
  if (!token) {
    return next(new ErrorHandler("Please Login to acess this resource"), 401);
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  reqs.user = await User.findById(decodedData.id);

  next();
});

exports.authorizedRoles = (...roles) => {
  return (reqs, resp, next) => {
    if (!roles.includes(reqs.user.role)) {
      return next(
        new ErrorHandler(
          `Role ${reqs.user.role} is not allowed to access to this resource`
        )
      );
    }
    next();
  };
};
