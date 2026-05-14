const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');
const { verifyPayment } = require('./payment.service');
const { sendOrderConfirmation } = require('./email.service');
const logger = require('../utils/logger');

// Generate unique order number (e.g., ORD-1683050000)
const generateOrderNumber = () => {
  return `ORD-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
};

/**
 * Create a new order from cart
 */
const createOrder = async (userId, orderData) => {
  const { shippingAddressId, billingAddressId, paymentMethod, stripePaymentIntentId } = orderData;

  // 1. Get User and Addresses
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const shippingAddress = user.addresses.id(shippingAddressId);
  const billingAddress = billingAddressId ? user.addresses.id(billingAddressId) : shippingAddress;

  if (!shippingAddress) throw new Error('Invalid shipping address');

  // 2. Get Cart and verify items
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.productId._id);
    if (!product) throw new Error(`Product ${item.productId.name} no longer exists`);

    const sizeInfo = product.sizes.find(s => s.size === item.size);
    if (!sizeInfo || sizeInfo.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name} (Size: ${item.size})`);
    }

    const price = product.discountPrice || product.price;
    subtotal += price * item.quantity;

    orderItems.push({
      productId: product._id,
      name: product.name,
      price: price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      image: product.images[0]?.url
    });
  }

  const shippingCost = subtotal > 150 ? 0 : 15; // Free shipping over $150
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + tax;

  // 3. Verify Payment (if Stripe)
  let paymentStatus = 'pending';
  if (paymentMethod === 'card' && stripePaymentIntentId) {
    const isPaid = await verifyPayment(stripePaymentIntentId);
    if (!isPaid) throw new Error('Payment not successful');
    paymentStatus = 'completed';
  }

  // START DATABASE TRANSACTION
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ATOMIC STOCK DECREMENT
    if (paymentStatus === 'completed') {
      for (const item of cart.items) {
        const productUpdate = await Product.findOneAndUpdate(
          { 
            _id: item.productId._id, 
            'sizes.size': item.size,
            'sizes.stock': { $gte: item.quantity } // Atomic check: must have enough stock
          },
          { $inc: { 'sizes.$.stock': -item.quantity } },
          { new: true, session }
        );

        if (!productUpdate) {
          throw new Error(`Maaf, stok untuk produk ${item.productId?.name || 'tersebut'} (Ukuran: ${item.size}) mendadak habis dibeli orang lain!`);
        }
      }
    }

    // 4. Create Order
    const order = new Order({
      orderNumber: generateOrderNumber(),
      userId,
      items: orderItems,
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country
      },
      billingAddress: {
        street: billingAddress.street,
        city: billingAddress.city,
        state: billingAddress.state,
        zipCode: billingAddress.zipCode,
        country: billingAddress.country
      },
      subtotal,
      shippingCost,
      tax,
      total,
      paymentMethod,
      paymentStatus,
      stripePaymentIntentId,
      status: paymentStatus === 'completed' ? 'processing' : 'pending'
    });
    
    await order.save({ session });

    // 5. Clear Cart
    if (paymentStatus === 'completed') {
      cart.items = [];
      await cart.save({ session });
    }

    // 6. COMMIT TRANSACTION
    await session.commitTransaction();
    session.endSession();

    // 7. Send email asynchronously (after commit success)
    if (paymentStatus === 'completed') {
      sendOrderConfirmation(user, order).catch(err => logger.error('Order Email Failed', err));
    }

    return order;

  } catch (error) {
    // ABORT TRANSACTION ON ANY ERROR
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get user orders
 */
const getUserOrders = async (userId) => {
  return await Order.find({ userId }).sort('-createdAt');
};

/**
 * Get order by ID
 */
const getOrderById = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');
  
  // Verify ownership
  if (order.userId.toString() !== userId.toString()) {
    throw new Error('Not authorized to view this order');
  }

  return order;
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById
};
