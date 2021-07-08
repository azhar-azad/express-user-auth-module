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