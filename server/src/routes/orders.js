const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/orders', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/orders', requireAuth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'cod', notes } = req.body;

    // shippingAddress may arrive as an object { fullName, address, city, state, pincode, phone }
    // or as a plain string — normalise to a string for storage
    let shippingAddressStr;
    if (typeof shippingAddress === 'object' && shippingAddress !== null) {
      const { fullName, address, city, state, pincode, phone } = shippingAddress;
      shippingAddressStr = [fullName, address, city, state, pincode, phone]
        .filter(Boolean)
        .join(', ');
    } else {
      shippingAddressStr = shippingAddress;
    }

    if (!shippingAddressStr) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) continue;
      const price = item.product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product: item.product._id,
        productName: item.product.name,
        price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
      });
    }

    const shippingFee = subtotal >= 500 ? 0 : 40;
    const total = subtotal + shippingFee;

    const order = await Order.create({
      user: req.user.userId,
      items: orderItems,
      shippingAddress: shippingAddressStr,
      paymentMethod,
      notes,
      subtotal,
      shippingFee,
      total,
      status: 'pending',
    });

    // Clear the cart after order is placed
    await Cart.findOneAndUpdate({ user: req.user.userId }, { items: [] });

    res.status(201).json(order);
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/orders/:id', requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
