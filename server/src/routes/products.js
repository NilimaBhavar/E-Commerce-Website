const express = require('express');
const Product = require('../models/Product');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

function makeSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
}

// GET /api/products/featured — get featured products (must be before /:id)
router.get('/products/featured', async (_req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .populate('category', 'name')
      .limit(12);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/offers — get products with discount
router.get('/products/offers', async (_req, res) => {
  try {
    const products = await Product.find({ discount: { $gt: 0 } })
      .populate('category', 'name')
      .sort({ discount: -1 })
      .limit(12);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products — list products with filtering, sorting, pagination
router.get('/products', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      categoryId,
      search,
      minPrice,
      maxPrice,
      sortBy,
      inStock,
    } = req.query;

    // Build the filter object
    const filter = {};
    if (categoryId) filter.category = categoryId;
    if (search) filter.name = { $regex: search, $options: 'i' }; // case-insensitive search
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (inStock === 'true') filter.stock = { $gte: 1 };

    // Build the sort object
    const sortOptions = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };
    const sort = sortOptions[sortBy] || { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Run query and count in parallel
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name').sort(sort).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/products/:id — get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/products — create product (admin only)
router.post('/products', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, originalPrice, discount, category, brand, stock, imageUrl, images, isFeatured, tags } = req.body;
    if (!name) return res.status(400).json({ error: 'Product name is required' });
    if (!price) return res.status(400).json({ error: 'Price is required' });
    if (!category) return res.status(400).json({ error: 'Category is required' });
    if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

    const slug = makeSlug(name);
    const product = await Product.create({ name, slug, description, price, originalPrice, discount, category, brand, stock, imageUrl, images, isFeatured, tags });
    const populated = await product.populate('category', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/products/:id — update product (admin only)
router.patch('/products/:id', requireAdmin, async (req, res) => {
  try {
    const allowed = ['name', 'description', 'price', 'originalPrice', 'discount', 'category', 'brand', 'stock', 'imageUrl', 'images', 'isFeatured', 'tags'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('category', 'name');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/products/:id — delete product (admin only)
router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
