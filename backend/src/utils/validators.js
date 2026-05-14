const Joi = require('joi');

const orderValidators = {
  createOrder: Joi.object({
    shippingAddressId: Joi.string().required().messages({
      'any.required': 'Shipping address is required'
    }),
    billingAddressId: Joi.string().optional(),
    paymentMethod: Joi.string().valid('card', 'cash').default('card'),
    stripePaymentIntentId: Joi.string().when('paymentMethod', {
      is: 'card',
      then: Joi.required(),
      otherwise: Joi.optional()
    }).messages({
      'any.required': 'Stripe payment intent ID is required for card payments'
    }),
    notes: Joi.string().max(500).optional()
  })
};

const paymentValidators = {
  createIntent: Joi.object({
    amount: Joi.number().positive().required().messages({
      'any.required': 'Amount is required',
      'number.positive': 'Amount must be positive'
    }),
    currency: Joi.string().length(3).default('usd')
  })
};

const authValidators = {
  register: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .required()
      .messages({
        'string.min': 'Password minimal harus 8 karakter.',
        'string.pattern.base': 'Password harus mengandung kombinasi huruf besar, huruf kecil, dan angka.',
        'any.required': 'Password wajib diisi.'
      })
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

module.exports = {
  orderValidators,
  paymentValidators,
  authValidators
};
