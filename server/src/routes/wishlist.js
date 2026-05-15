const express = require('express');
const Wishlist = require('../models/Wishlist');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function toWishlistItem(product) {
  return {
    id: product.id,
    productId: product.id,
    productName: product.name,
    imageUrl: product.imageUrl,
    price: product.price,
    originalPrice: product.originalPrice,
    discount: product.discount,
    rating: product.rating,
    stock: product.stock,
    brand: product.brand,
  };
}

router.get('/wishlist', requireAuth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.userId }).populate('products');
    if (!wishlist || !wishlist.products.length) return res.json([]);
    res.json(wishlist.products.map(toWishlistItem));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/wishlist', requireAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID is required' });

    let wishlist = await Wishlist.findOne({ user: req.user.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.userId, products: [] });
    }

    if (!wishlist.products.map((id) => id.toString()).includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    await wishlist.populate('products');
    res.json(wishlist.products.map(toWishlistItem));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/wishlist/:productId', requireAuth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.userId });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== req.params.productId
      );
      await wishlist.save();
    }
    const updated = await Wishlist.findOne({ user: req.user.userId }).populate('products');
    res.json(updated && updated.products.length ? updated.products.map(toWishlistItem) : []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
