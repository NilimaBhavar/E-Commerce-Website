const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats — dashboard statistics
router.get('/admin/stats', requireAdmin, async (_req, res) => {
  try {
    // Run all count queries in parallel for speed
    const [totalUsers, totalProducts, totalOrders, revenueResult, recentOrdersRaw] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    // Orders grouped by status
    const statusAgg = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const ordersByStatus = statusAgg.map((s) => ({ status: s._id, count: s.count }));

    // Revenue by month (last 6 months)
    const monthAgg = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%b %Y', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          month_sort: { $first: { $dateToString: { format: '%Y-%m', date: '$createdAt' } } },
        },
      },
      { $sort: { month_sort: -1 } },
      { $limit: 6 },
    ]);
    const revenueByMonth = monthAgg.map((m) => ({
      month: m._id,
      revenue: m.revenue,
      orders: m.orders,
    }));

    // Top categories by product count
    const cats = await Category.find();
    const topCategories = await Promise.all(
      cats.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat._id });
        return { name: cat.name, productCount };
      })
    );

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders: recentOrdersRaw,
      ordersByStatus,
      revenueByMonth,
      topCategories: topCategories.sort((a, b) => b.productCount - a.productCount).slice(0, 6),
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/orders — list all orders (admin only)
router.get('/admin/orders', requireAdmin, async (_req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/orders/:id/status — update order status
router.patch('/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('user', 'name');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/users — list all users
router.get('/admin/users', requireAdmin, async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
