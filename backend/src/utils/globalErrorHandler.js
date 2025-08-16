export const globalErrorHandler = (error, req, res, next) => {
  console.error(`Error: ${error}`);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};
