const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist } = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // All wishlist routes are protected

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

module.exports = router;
