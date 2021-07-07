const Todo = require('../models/Todo');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async.mw');

/**
 *  @desc   Get all todos
 *  @method GET
 *  @route  /api/v1/todos
 *  @access Public
 * */
exports.getTodos = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .json(res.advancedResults);
});

/**
 *  @desc   Get single todo
 *  @method GET
 *  @route  /api/v1/todos/:id
 *  @access Public
 * */
exports.getTodo = asyncHandler(async (req, res, next) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    return next(new ErrorResponse(`Todo not found with id of ${req.params.id}`, 404));
  }

  res
    .status(200)
    .json({ success: true, data: todo });
});

/**
 *  @desc   Create new todo
 *  @method POST
 *  @route  /api/v1/todos
 *  @access Private
 * */
exports.createTodo = asyncHandler(async (req, res, next) => {
  const todo = await Todo.create(req.body);

  res
    .status(201)
    .json({ success: true, data: todo });
});

/**
 *  @desc   Update todo
 *  @method PUT
 *  @route  /api/v1/todos/:id
 *  @access Private
 * */
exports.updateTodo = asyncHandler(async (req, res, next) => {
  let todo = await Todo.findById(req.params.id);

  if (!todo) {
    return next(new ErrorResponse(`Todo not found with id of ${req.params.id}`, 404));
  }

  todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  res
    .status(200)
    .json({ success: true, data: todo });
});

/**
 *  @desc   Delete todo
 *  @method DELETE
 *  @route  /api/v1/todos/:id
 *  @access Private
 * */
exports.deleteTodo = asyncHandler(async (req, res, next) => {
  const todo = await Todo.findById(req.params.id);

  if (!todo) {
    return next(new ErrorResponse(`Todo not found with id of ${req.params.id}`, 404));
  }

  todo.remove();

  res
    .status(200)
    .json({ success: true, data: {} });
});