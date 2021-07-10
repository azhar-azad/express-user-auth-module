const User = require('../models/User');
const asyncHandler = require('../middlewares/async.mw');
const ErrorResponse = require('../utils/errorResponse');

/**
 *  @desc   Get all users
 *  @method GET
 *  @route  /api/v1/users
 *  @access Private/Admin
 * */
exports.getUsers = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .json(res.advancedResults);
});

/**
 *  @desc   Get single user
 *  @method GET
 *  @route  /api/v1/users/:id
 *  @access Private/Admin
 * */
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res
    .status(200)
    .json({ success: true, data: user });
});

/**
 *  @desc   Create user
 *  @method POST
 *  @route  /api/v1/users
 *  @access Private/Admin
 * */
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res
    .status(201)
    .json({ success: true, data: user });
});

/**
 *  @desc   Update user
 *  @method PUT
 *  @route  /api/v1/users/:id
 *  @access Private/Admin
 * */
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  if (req.body.fullName)
    user.fullName = req.body.fullName;
  if (req.body.email)
    user.email = req.body.email;
  if(req.body.password)
    user.password = req.body.password;

  await user.save();

  res
    .status(200)
    .json({ success: true, data: user });
});

/**
 *  @desc   Delete user
 *  @method DELETE
 *  @route  /api/v1/users/:id
 *  @access Private/Admin
 * */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  user.remove();

  res
    .status(200)
    .json({ success: true, data: {} });
});