const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getInvoice
} = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { orderValidators } = require('../utils/validators');

const router = express.Router();

router.use(protect);

router.post('/', validate(orderValidators.createOrder), createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.get('/:id/invoice', getInvoice);

module.exports = router;
