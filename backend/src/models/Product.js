const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['men', 'women', 'kids', 'unisex']
  },
  brand: {
    type: String,
    required: [true, 'Please provide a brand']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price']
  },
  discountPrice: {
    type: Number
  },
  sizes: [
    {
      size: { type: String, required: true },
      stock: { type: Number, default: 0 }
    }
  ],
  colors: [String],
  images: [
    {
      url: { type: String, required: true },
      altText: String,
      publicId: String
    }
  ],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    required: [true, 'Please provide an SKU'],
    unique: true
  },
  specifications: {
    material: String,
    sole: String,
    height: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
