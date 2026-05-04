const cartService = require('../services/cart.service');

/**
 * @desc    Get current user's cart
 * @route   GET /api/v1/cart
 * @access  Private
 */
const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart/items
 * @access  Private
 */
const addItem = async (req, res, next) => {
  try {
    const cart = await cartService.addItemToCart(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/v1/cart/items/:itemId
 * @access  Private
 */
const updateQuantity = async (req, res, next) => {
  try {
    const cart = await cartService.updateItemQuantity(
      req.user.id,
      req.params.itemId,
      req.body.quantity
    );
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/items/:itemId
 * @access  Private
 */
const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeItemFromCart(req.user.id, req.params.itemId);
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/v1/cart
 * @access  Private
 */
const clearCart = async (req, res, next) => {
  try {
    await cartService.clearCart(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart
};
