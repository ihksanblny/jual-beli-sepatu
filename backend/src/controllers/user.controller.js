const userService = require('../services/user.service');

/**
 * @desc    Get user addresses
 * @route   GET /api/v1/user/addresses
 * @access  Private
 */
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await userService.getAddresses(req.user.id);
    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add shipping address
 * @route   POST /api/v1/user/address
 * @access  Private
 */
const addAddress = async (req, res, next) => {
  try {
    const addresses = await userService.addAddress(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update address
 * @route   PUT /api/v1/user/address/:id
 * @access  Private
 */
const updateAddress = async (req, res, next) => {
  try {
    const addresses = await userService.updateAddress(req.user.id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/v1/user/address/:id
 * @access  Private
 */
const deleteAddress = async (req, res, next) => {
  try {
    const addresses = await userService.deleteAddress(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
};
