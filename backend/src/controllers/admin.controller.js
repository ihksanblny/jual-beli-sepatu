const adminService = require('../services/admin.service');

/**
 * @desc    Get dashboard stats
 * @route   GET /api/v1/admin/dashboard
 * @access  Private/Admin
 */
const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/v1/admin/users
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders
 * @route   GET /api/v1/admin/orders
 * @access  Private/Admin
 */
const getOrders = async (req, res, next) => {
  try {
    const result = await adminService.getAllOrders(req.query);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/v1/admin/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await adminService.updateOrderStatus(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getOrders,
  updateOrderStatus
};
