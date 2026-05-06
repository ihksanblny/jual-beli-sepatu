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

  // Calculate category distribution dynamically
  const completedOrders = await Order.find({ paymentStatus: 'completed' }).populate('items.productId');
  const salesByCategory = { men: 0, women: 0, kids: 0, unisex: 0 };
  let totalCategorySales = 0;

  for (const order of completedOrders) {
    for (const item of order.items) {
      if (item.productId) {
        const cat = item.productId.category || 'unisex';
        const itemSales = item.price * item.quantity;
        salesByCategory[cat] = (salesByCategory[cat] || 0) + itemSales;
        totalCategorySales += itemSales;
      }
    }
  }

  // Fallback to product count distribution if no sales exist yet
  if (totalCategorySales === 0) {
    const categoryCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countsMap = {};
    categoryCounts.forEach(c => {
      countsMap[c._id] = c.count;
    });

    ['men', 'women', 'kids', 'unisex'].forEach(catName => {
      const count = countsMap[catName] || 0;
      salesByCategory[catName] = count;
      totalCategorySales += count;
    });
  }

  // Map backend categories to beautiful frontend entities
  const categories = ['men', 'women', 'kids', 'unisex'].map(catName => {
    const rawValue = salesByCategory[catName] || 0;
    const percent = totalCategorySales > 0 ? Math.round((rawValue / totalCategorySales) * 100) : 0;
    const labelMap = { men: 'Men', women: 'Women', kids: 'Kids', unisex: 'Unisex' };
    const colorMap = { men: 'bg-primary', women: 'bg-orange-500', kids: 'bg-purple-500', unisex: 'bg-blue-500' };
    return {
      name: labelMap[catName] || catName,
      percent,
      color: colorMap[catName] || 'bg-gray-500'
    };
  });

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
    categories,
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

/**
 * Get single order by ID (Admin version)
 */
const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId).populate('userId', 'firstName lastName email');
  if (!order) throw new Error('Order not found');
  return order;
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  getOrderById
};
