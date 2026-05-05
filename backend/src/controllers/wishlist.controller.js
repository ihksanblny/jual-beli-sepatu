const User = require('../models/User');

/**
 * @desc    Get user wishlist
 * @route   GET /api/v1/wishlist
 * @access  Private
 */
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle product in wishlist
 * @route   POST /api/v1/wishlist/toggle
 * @access  Private
 */
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      // Add to wishlist
      user.wishlist.push(productId);
    } else {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
    }

    await user.save();
    
    // Return the updated wishlist (IDs only for efficiency)
    res.status(200).json({
      success: true,
      data: user.wishlist,
      message: index === -1 ? 'Added to wishlist' : 'Removed from wishlist'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist
};
