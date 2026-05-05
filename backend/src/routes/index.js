const express = require('express');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const userRoutes = require('./user.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const adminRoutes = require('./admin.routes');
const wishlistRoutes = require('./wishlist.routes');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/user', userRoutes);
router.use('/orders', orderRoutes);
router.use('/payment', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/wishlist', wishlistRoutes);

module.exports = router;
