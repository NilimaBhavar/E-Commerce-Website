const express = require('express');

// Import all route files
const authRoutes = require('./auth');
const categoryRoutes = require('./categories');
const productRoutes = require('./products');
const cartRoutes = require('./cart');
const orderRoutes = require('./orders');
const reviewRoutes = require('./reviews');
const wishlistRoutes = require('./wishlist');
const userRoutes = require('./users');
const adminRoutes = require('./admin');
const healthRoutes = require('./health');

const router = express.Router();

// Register all routes
router.use(authRoutes);
router.use(categoryRoutes);
router.use(productRoutes);
router.use(cartRoutes);
router.use(orderRoutes);
router.use(reviewRoutes);
router.use(wishlistRoutes);
router.use(userRoutes);
router.use(adminRoutes);
router.use(healthRoutes);

module.exports = router;
