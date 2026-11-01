const { AppError } = require('../utils/errors');

function notFoundHandler(_req, _res, next) {
  next(new AppError('Route not found', 404, 'NOT_FOUND'));
}

module.exports = { notFoundHandler };
