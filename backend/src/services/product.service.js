const Product = require('../models/Product');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const logger = require('../utils/logger');

/**
 * Get all products with filters, search, and pagination
 */
const getAllProducts = async (queryParams) => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    size,
    color,
    search,
    sale,
    sort,
    featured,
    page = 1,
    limit = 10
  } = queryParams;

  const query = { isActive: true };

  // Filters
  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (featured === 'true' || featured === true) {
    query.featured = true;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (size) query['sizes.size'] = size;
  if (color) query.colors = color;
  if (search) {
    query.$text = { $search: search };
  }
  if (sale === 'true' || sale === true) {
    query.discountPrice = { $gt: 0 };
  }

  // Sorting
  let sortStr = '-createdAt';
  if (sort) {
    if (sort === 'price-low') sortStr = 'price';
    if (sort === 'price-high') sortStr = '-price';
    if (sort === 'rating') sortStr = '-rating';
  }

  const skip = (page - 1) * limit;

  const products = await Product.find(query)
    .sort(sortStr)
    .skip(skip)
    .limit(Number(limit));

  const total = await Product.countDocuments(query);

  return {
    products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get product by ID
 */
const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');
  return product;
};

/**
 * Create product (Admin only)
 */
const createProduct = async (productData) => {
  const product = await Product.create(productData);
  return product;
};

/**
 * Update product (Admin only)
 */
const updateProduct = async (id, updateData) => {
  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
  if (!product) throw new Error('Product not found');
  return product;
};

/**
 * Delete product (Admin only)
 */
const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error('Product not found');

  product.isActive = false;
  await product.save();
  return { message: 'Product deleted' };
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
