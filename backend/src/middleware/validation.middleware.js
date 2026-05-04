const Joi = require('joi');

/**
 * Middleware to validate request body using Joi schema
 * @param {Joi.Schema} schema - The Joi schema to validate against
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    const err = new Error(errorMessage);
    err.statusCode = 400;
    return next(err);
  }

  // Replace req.body with validated and stripped value
  req.body = value;
  next();
};

module.exports = validate;
