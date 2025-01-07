const { validationResult } = require("express-validator");
const { CustomError } = require("../helpers/utils");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new CustomError("Validation failed", 400);
    error.extraData = errors.array().map((error) => ({
      location: error.location,
      field: error.path,
      value: error.value,
      message: error.msg,
    }));

    return next(error);
  }

  next();
};

module.exports = validateRequest;
