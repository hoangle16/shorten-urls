const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const extraData = err.extraData || null;

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "production" ? null : err.stack,
    extraData,
  });
};

module.exports = errorHandler;
