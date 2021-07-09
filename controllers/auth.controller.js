const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async.mw');

/**
 *  @desc   Register user
 *  @method POST
 *  @route  /api/v1/auth/register
 *  @access Public
 * */
exports.register = asyncHandler(async (req, res, next) => {
  const { fullName, username, email, password, role } = req.body;

  // Create user
  const user = await User.create({
    fullName,
    username,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
});

/**
 *  @desc   Login user
 *  @method POST
 *  @route  /api/v1/auth/login
 *  @access Public
 * */
exports.login = asyncHandler(async (req, res, next) => {
  let { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email or username and password', 400));
  }

  // Check for user by email
  // While retrieving user select password field too for validation
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatched = await user.matchPassword(password);

  if (!isMatched) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

/**
 *  @desc   Get current logged in user
 *  @method GET
 *  @route  /api/v1/auth/me
 *  @access Private [Logged in user can access]
 * */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res
    .status(200)
    .json({ success: true, data: user });
});

/**
 *  @desc   Update user details
 *  @method PUT
 *  @route  /api/v1/auth/updatedetails
 *  @access Private [Logged in user can access]
 * */
exports.updateDetails = asyncHandler(async (req, res, next) => {
  // Only update fullName and email.
  // Won't update password or role.
  let fieldsToUpdate = {};

  if (req.body.fullName) {
    fieldsToUpdate.fullName = req.body.fullName;
  }
  if (req.body.email) {
    fieldsToUpdate.email = req.body.email;
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res
    .status(200)
    .json({ success: true, data: user });
});

/**
 *  @desc   Change password
 *  @method PUT
 *  @route  /api/v1/auth/changepassword
 *  @access Private [Logged in user can access]
 * */
exports.changePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});


/** Util Method **/
// Get token from model, create cookie and send response
// This is just a helper function
// A token will be created and sent with json response when this function will be called
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Cookie options
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), // 1d
    httpOnly: true
  };

  // Only secure cookie when in production
  if (process.env.APP_ENV === 'production') {
    options.secure = true;
  }

  // Sending token as json response as well as with cookie.
  res
    .status(statusCode)
    .cookie('token', token, options) // cookie: name, value, options
    .json({
      success: true,
      token
    });
}