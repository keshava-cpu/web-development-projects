const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null } = {}) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

const sendFailure = (res, { statusCode = 400, message = 'Request failed' } = {}) => {
  return res.status(statusCode).json({
    status: 'failure',
    message,
  });
};

module.exports = {
  sendSuccess,
  sendFailure,
};
