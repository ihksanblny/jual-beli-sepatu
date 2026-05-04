const express = require('express');
const { createIntent } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { paymentValidators } = require('../utils/validators');

const router = express.Router();

router.use(protect);

router.post('/intent', validate(paymentValidators.createIntent), createIntent);

module.exports = router;
