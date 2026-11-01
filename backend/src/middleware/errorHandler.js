const { AppError } = require('../utils/errors');

function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err?.type === 'entity.parse.failed') {
    err = new AppError('Request body must contain valid JSON', 400, 'INVALID_JSON');
  }

  const statusCode = Number.isInteger(err?.statusCode)
    ? err.statusCode
    : Number.isInteger(err?.status)
      ? err.status
      : 500;
  const isExpectedError = err instanceof AppError;
  const validationDetails = Array.isArray(err?.errors)
    ? err.errors.map((item) => item.message ?? String(item))
    : undefined;
  const response = {
    error: {
      code: isExpectedError
        ? err.code
        : statusCode === 400
          ? 'VALIDATION_ERROR'
          : statusCode === 404
            ? 'NOT_FOUND'
            : 'INTERNAL_ERROR',
      message: statusCode >= 500 ? 'An unexpected error occurred' : err.message,
    },
  };

  const details = err.details ?? validationDetails;
  if (statusCode < 500 && details !== undefined) {
    response.error.details = details;
  }

  if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  return res.status(statusCode).json(response);
}

module.exports = { errorHandler };
