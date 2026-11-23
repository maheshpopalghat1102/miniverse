const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error.";

  if (res.headersSent) {
    return next(err);
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];

    message = field
      ? `${field} already exists.`
      : "A record with this information already exists.";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID.";
  }

  // Invalid JSON body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON request body.";
  }

  // JWT errors outside auth middleware
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired.";
  }

  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  console.error(`[${statusCode}] ${req.method} ${req.originalUrl}`, err);

  res.status(statusCode).json(response);
};

export default errorMiddleware;