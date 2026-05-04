const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Calculate total revenue from delivered/completed orders
  const revenueResult = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // Get recent orders
  const recentOrders = await Order.find()
    .sort('-createdAt')
    .limit(5)
    .populate('userId', 'firstName lastName email');

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders
  };
};

/**
 * Get all users
 */
const getAllUsers = async (queryParams) => {
  const { page = 1, limit = 10, search } = queryParams;
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get all orders
 */
const getAllOrders = async (queryParams) => {
  const { page = 1, limit = 10, status } = queryParams;
  const skip = (page - 1) * limit;

  const query = {};
  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate('userId', 'firstName lastName email')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  const total = await Order.countDocuments(query);

  return {
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Update order status
 */
const updateOrderStatus = async (orderId, statusData) => {
  const { status, trackingNumber } = statusData;

  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');

  order.status = status || order.status;
  if (trackingNumber) order.trackingNumber = trackingNumber;

  if (status === 'delivered') {
    order.deliveredAt = Date.now();
  }

  await order.save();
  return order;
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  updateOrderStatus
};
