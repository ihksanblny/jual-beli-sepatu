const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Please provide a review title'],
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: 1000
  },
  images: [String], // Array of image URLs (optional)
  helpful: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Set to 'pending' if moderation is required
  }
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Static method to get average rating and save
reviewSchema.statics.getAverageRating = async function(productId) {
  const obj = await this.aggregate([
    {
      $match: { productId: productId, status: 'approved' }
    },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      rating: obj[0]?.averageRating || 0,
      reviewCount: obj[0]?.numReviews || 0
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.productId);
});

// Call getAverageRating after remove
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.getAverageRating(doc.productId);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
