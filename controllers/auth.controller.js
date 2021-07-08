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