const paymentService = require('../services/payment.service');
const logger = require('../utils/logger');

/**
 * @desc    Create Payment Intent
 * @route   POST /api/v1/payment/intent
 * @access  Private
 */
const createIntent = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const result = await paymentService.createPaymentIntent(amount, currency, {
      userId: req.user.id
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIntent
};
