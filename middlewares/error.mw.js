const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  // Copying all properties of 'err' to 'error' using spread operator.
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.log(err);
  console.log(`err.name: ${err.name}`);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered ${JSON.stringify(err.keyValue)}`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(value => value.message);
    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({
      success: false,
      error: error.message || 'Server Error'
    });
};

module.exports = errorHandler;