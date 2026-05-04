const Review = require('../models/Review');
const Order = require('../models/Order');

/**
 * Get reviews for a product
 */
const getProductReviews = async (productId, queryParams) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = queryParams;
  const skip = (page - 1) * limit;

  const query = { productId, status: 'approved' };

  const reviews = await Review.find(query)
    .populate('userId', 'firstName lastName profileImage')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Review.countDocuments(query);

  return {
    reviews,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Create a new review
 */
const createReview = async (userId, reviewData) => {
  const { productId } = reviewData;

  // 1. Check if user already reviewed this product
  const alreadyReviewed = await Review.findOne({ productId, userId });
  if (alreadyReviewed) {
    throw new Error('You have already reviewed this product');
  }

  // 2. Check if user has purchased the product
  const hasPurchased = await Order.findOne({
    userId,
    'items.productId': productId,
    status: 'delivered' // Ideally only allow reviews for delivered items
  });

  // For this prototype, we'll allow reviews even if not purchased, 
  // but in production, you might want to enforce the `hasPurchased` check.

  const review = await Review.create({
    ...reviewData,
    userId
  });

  return review;
};

/**
 * Update a review
 */
const updateReview = async (reviewId, userId, updateData) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error('Review not found');

  if (review.userId.toString() !== userId.toString()) {
    throw new Error('Not authorized to update this review');
  }

  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    {
      rating: updateData.rating,
      title: updateData.title,
      comment: updateData.comment,
      images: updateData.images,
      status: 'pending' // Re-require approval if edited (optional based on policy)
    },
    { new: true, runValidators: true }
  );

  // Trigger getAverageRating calculation
  updatedReview.constructor.getAverageRating(updatedReview.productId);

  return updatedReview;
};

/**
 * Delete a review
 */
const deleteReview = async (reviewId, userId, userRole) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new Error('Review not found');

  // Allow deletion if the user is the author or an admin
  if (review.userId.toString() !== userId.toString() && userRole !== 'admin') {
    throw new Error('Not authorized to delete this review');
  }

  await Review.findOneAndDelete({ _id: reviewId });
  return { message: 'Review removed' };
};

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
};
