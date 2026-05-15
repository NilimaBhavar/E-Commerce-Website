const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/products/:productId/reviews — get all reviews for a product
router.get('/products/:productId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/products/:productId/reviews — add a review (must be logged in)
router.post('/products/:productId/reviews', requireAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Create the review
    const review = await Review.create({
      user: req.user.userId,
      product: productId,
      rating: Number(rating),
      comment,
    });

    // Recalculate average rating for the product
    const allReviews = await Review.find({ product: productId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 100) / 100,
      reviewCount: allReviews.length,
    });

    const populated = await review.populate('user', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
