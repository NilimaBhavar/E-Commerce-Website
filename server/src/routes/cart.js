const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

async function buildCartResponse(userId) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    return { items: [], subtotal: 0, itemCount: 0 };
  }

  const items = cart.items
    .filter((item) => item.product)
    .map((item) => ({
      id: item.product.id,          // used as React key + itemId for update/remove
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      imageUrl: item.product.imageUrl,
      brand: item.product.brand,
      stock: item.product.stock,
    }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, itemCount };
}

router.get('/cart', requireAuth, async (req, res) => {
  try {
    res.json(await buildCartResponse(req.user.userId));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/cart/items', requireAuth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID is required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) cart = new Cart({ user: req.user.userId, items: [] });

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.json(await buildCartResponse(req.user.userId));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/cart/items/:productId', requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    } else {
      const item = cart.items.find((item) => item.product.toString() === productId);
      if (item) item.quantity = quantity;
    }

    await cart.save();
    res.json(await buildCartResponse(req.user.userId));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/cart/items/:productId', requireAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await cart.save();
    res.json(await buildCartResponse(req.user.userId));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/cart', requireAuth, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user.userId }, { items: [] });
    res.json({ items: [], subtotal: 0, itemCount: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
