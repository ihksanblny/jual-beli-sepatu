const express = require('express');
const {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart
} = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // All cart routes are protected

router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:itemId', updateQuantity);
router.delete('/items/:itemId', removeItem);
router.delete('/', clearCart);

module.exports = router;
