const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Get user's cart
 */
const getCart = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

/**
 * Add item to cart
 */
const addItemToCart = async (userId, itemData) => {
  const { productId, quantity, size, color } = itemData;

  // Check if product exists and has stock
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const sizeInfo = product.sizes.find(s => s.size === size);
  if (!sizeInfo || sizeInfo.stock < quantity) {
    throw new Error('Requested quantity exceeds available stock');
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  // Check if item already in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId && item.size === size
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, size, color });
  }

  await cart.save();
  return cart.populate('items.productId');
};

/**
 * Update item quantity
 */
const updateItemQuantity = async (userId, itemId, quantity) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error('Cart not found');

  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
  if (itemIndex === -1) throw new Error('Item not found in cart');

  // Verify stock
  const item = cart.items[itemIndex];
  const product = await Product.findById(item.productId);
  const sizeInfo = product.sizes.find(s => s.size === item.size);
  
  if (sizeInfo.stock < quantity) {
    throw new Error('Requested quantity exceeds available stock');
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  return cart.populate('items.productId');
};

/**
 * Remove item from cart
 */
const removeItemFromCart = async (userId, itemId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error('Cart not found');

  cart.items = cart.items.filter(item => item._id.toString() !== itemId);
  await cart.save();
  return cart.populate('items.productId');
};

/**
 * Clear cart
 */
const clearCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new Error('Cart not found');

  cart.items = [];
  await cart.save();
  return cart;
};

module.exports = {
  getCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart
};
