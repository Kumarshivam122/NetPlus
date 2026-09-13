const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({
      success: false,
      message: 'Internal Server Error',
    });
  } else {
    res.status(err.status || 500).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }
};

module.exports = errorHandler;
