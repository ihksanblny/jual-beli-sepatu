const logger = require('../utils/logger');

/**
 * Create a Stripe Payment Intent
 */
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency,
      metadata
    });

    return {
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    };
  } catch (error) {
    logger.error('Stripe Error:', error);
    throw new Error('Payment service failed');
  }
};

/**
 * Verify a payment intent status
 */
const verifyPayment = async (paymentIntentId) => {
  // Bypass Stripe verification for dummy local testing (disabled in production)
  if (process.env.NODE_ENV !== 'production' && paymentIntentId && paymentIntentId.startsWith('pi_dummy_test_')) {
    return true;
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  } catch (error) {
    logger.error('Stripe Verify Error:', error);
    throw new Error('Payment verification failed');
  }
};

module.exports = {
  createPaymentIntent,
  verifyPayment
};
