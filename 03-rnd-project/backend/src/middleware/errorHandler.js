const multer = require('multer');
const { sendFailure } = require('../utils/response');

const notFound = (req, res) => {
  sendFailure(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Utilization report exceeds the 10 MB size limit.'
        : err.message;

    return sendFailure(res, { statusCode: 400, message });
  }

  if (err.message === 'Only PDF files are allowed for utilization reports.') {
    return sendFailure(res, { statusCode: 400, message: err.message });
  }

  console.error(err);

  return sendFailure(res, {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal server error.',
  });
};

module.exports = {
  notFound,
  errorHandler,
};
