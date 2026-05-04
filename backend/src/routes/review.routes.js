const express = require('express');
const {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

// Needs mergeParams: true to access productId from product router
const router = express.Router({ mergeParams: true });

router.get('/', getProductReviews);

router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
