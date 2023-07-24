const { HTTP_CODES } = require("../json/enums.json");

module.exports = {
  BAD_REQUEST: ({ res, message = "-", data = {} } = {}) => {
    res.status(HTTP_CODES.BAD_REQUEST).json({
      success: false,
      message: message,
      payload: data,
    });
  },

  CATCH_ERROR: ({ res, message = "-", data = {} } = {}) => {
    let responseCode = HTTP_CODES.INTERNAL_SERVER_ERROR;
    if ((message && message.includes("validation failed")) || message.includes("duplicate key error collection")) responseCode = HTTP_CODES.BAD_REQUEST;
    res.status(responseCode).json({
      success: false,
      message: message,
      payload: data,
    });
  },

  OK: ({ res, message = "-", data = {} } = {}) => {
    res.status(HTTP_CODES.OK).json({
      success: true,
      messages: message,
      payload: data,
    });
  },

  UNAUTHORIZED: ({ res, message = "-", data = {} } = {}) => {
    res.status(HTTP_CODES.UNAUTHORIZED).json({
      success: false,
      message: message,
      payload: data,
    });
  }
};
