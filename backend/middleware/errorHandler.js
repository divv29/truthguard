/**
 * Global error handling middleware.
 * Catches any error passed via next(err) throughout the app.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path} —`, err.message);

  // Postgres-specific errors
  if (err.code === "23502") {
    return res.status(400).json({
      error: "Validation error",
      message: "A required field is missing.",
    });
  }

  if (err.code === "23505") {
    return res.status(409).json({
      error: "Conflict",
      message: "Duplicate entry.",
    });
  }

  if (err.code === "22P02") {
    return res.status(400).json({
      error: "Validation error",
      message: "Invalid data type provided.",
    });
  }

  // Default
  return res.status(err.status || 500).json({
    error: err.name || "Internal server error",
    message: err.message || "An unexpected error occurred.",
  });
};

/**
 * 404 handler for unmatched routes.
 */
const notFound = (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} does not exist.`,
  });
};

module.exports = { errorHandler, notFound };
