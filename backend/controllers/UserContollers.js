const User = require("../models/Usermodels");
const ErrorHandler = require("../utils/ErrorHandler");
const sendToken = require("../utils/JWTToken");
const catchAsyncError = require("../middleware/catchAsyncError");
const { sendEmail } = require("../utils/sendEmail");
const crypto = require("crypto");
// Register User
exports.regiseterUser = catchAsyncError(async (reqs, resp, next) => {
  const { name, email, password } = reqs.body;
  // const preuser = await usermodels.find(email);
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is sample id",
      url: "rjojldffd",
    },
  });
  sendToken(user, 201, resp);
});

// login user
exports.loginUser = catchAsyncError(async (reqs, resp, next) => {
  const { email, password } = reqs.body;

  // checking if user exist
  if (!email || !password) {
    return next(new ErrorHandler("please Enter Email and password", 400));
  }

  const preUser = await User.findOne({ email }).select("+password");

  if (!preUser) {
    return next(new ErrorHandler("Invlaid Email or Password", 401));
  }

  const isPasswordMatched = await preUser.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invlaid Email or Password", 401));
  }

  sendToken(preUser, 200, resp);
});

// User Logout
exports.logout = catchAsyncError(async (reqs, resp, next) => {
  resp.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  resp.status(200).json({
    sucess: true,
    message: "logout Sucessfully",
  });
});

// forget password

exports.forgotPassword = catchAsyncError(async (reqs, resp, next) => {
  const { email } = reqs.body;
  const preuser = await User.findOne({ email: email });

  if (!preuser) {
    return next(
      new ErrorHandler("User is not registerd , please register", 401)
    );
  }
  const resetToken = preuser.getResetPasswordToken();

  await preuser.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${reqs.protocol}://${reqs.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :-\n\n ${resetPasswordUrl} \n\n If you have not requested this email please ignore it`;
  console.log(message);

  try {
    await sendEmail({
      email: preuser.email,
      subject: "Ecommerce password Recovery",
      message,
    });

    resp.status(200).json({
      sucess: true,
      message: `Email sent to ${email} sucessfully`,
    });
  } catch (error) {
    (preuser.restPasswordToken = undefined),
      (preuser.resetPasswordExpire = undefined);

    await preuser.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 404));
  }
});

// resetPassword
exports.resetPassword = catchAsyncError(async (reqs, resp, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(reqs.params.token)
    .digest("hex");

  const preuser = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!preuser) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired",
        400
      )
    );
  }
  if (reqs.body.password != reqs.body.confirmPassword) {
    return next(new ErrorHandler("password does not match", 400));
  }
  preuser.password = reqs.body.password;
  preuser.resetPasswordToken = undefined;
  preuser.resetPasswordExpire = undefined;
  await preuser.save();
  sendToken(preuser, 202, resp);
});

// Get User details
exports.getUserDetails = catchAsyncError(async (reqs, resp, next) => {
  // const id = reqs.user.id;
  const preuser = await User.findById(reqs.user.id);

  resp.status(200).json({
    sucess: true,
    preuser,
  });
});

// update password
exports.updatePassword = catchAsyncError(async (reqs, resp, next) => {
  // const { oldPassword, newPassword } = reqs.body;
  // if (!oldPassword || !newPassword) {
  //   return next(
  //     new ErrorHandler("Please Enter oldPassword and newPassword", 401)
  //   );
  // }
  const preuser = await User.findById(reqs.user.id).select("+password");

  // matching entered password
  const isPasswordMatched = await preuser.comparePassword(
    reqs.body.oldPassword
  );
  if (!isPasswordMatched) {
    return next(new ErrorHandler("old password is invalid", 401));
  }

  if (reqs.body.newPassword !== reqs.body.confirmPassword) {
    return next(new ErrorHandler("password does not match", 400));
  }
  preuser.password = reqs.body.newPassword;
  await preuser.save();

  sendToken(preuser, 200, resp);
});

// update user Profile
exports.updateProfile = catchAsyncError(async (reqs, resp, next) => {
  const newUserData = {
    name: reqs.body.name,
    email: reqs.body.email,
  };
  const preuser = await User.findByIdAndUpdate(reqs.user.id, newUserData, {
    new: true,
    runValidators: true,
    usefindAndModify: false,
  });
  resp.status(200).json({
    sucess: true,
    preuser,
  });
});

//Get all users -- admin
exports.getAllUsers = catchAsyncError(async (reqs, resp, next) => {
  const users = await User.find();

  resp.status(200).json({
    sucess: true,
    users,
  });
});

// get single users --(admin)
exports.getSingleUser = catchAsyncError(async (reqs, resp, next) => {
  const user = await User.findById(reqs.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`User not exist with id : ${reqs.params.id}`, 401)
    );
  }

  resp.status(200).json({
    sucess: true,
    user,
  });
});

// update user role -- (--admin)
exports.updateUserRole = catchAsyncError(async (reqs, resp, next) => {
  const user = await User.findById(reqs.params.id);
  const newUserData = {
    name: reqs.body.name,
    email: reqs.body.email,
    role: reqs.body.role,
  };
  const preuser = await User.findByIdAndUpdate(reqs.params.id, newUserData, {
    new: true,
    runValidators: true,
    usefindAndModify: false,
  });
  resp.status(200).json({
    sucess: true,
    preuser,
  });
});
//delete user (--admin)
exports.deleteUser = catchAsyncError(async (reqs, resp, next) => {
  const user = await User.findById(reqs.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`User is not found with the id : ${reqs.params.id}`, 400)
    );
  }
  await User.deleteOne({ _id: reqs.params.id });

  resp.status(200).json({
    sucess: true,
    message: "User have been delted sucessfully",
  });
});
