const express = require('express');
const Category = require('../models/Category');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Helper: create a URL-friendly slug from a name
function makeSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// GET /api/categories — list all categories
router.get('/categories', async (_req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/categories/:id — get single category
router.get('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/categories — create category (admin only)
router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const slug = makeSlug(name);
    const category = await Category.create({ name: name.trim(), slug, description, imageUrl });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/categories/:id — update category (admin only)
router.patch('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    const updates = {};
    if (name) { updates.name = name.trim(); updates.slug = makeSlug(name); }
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;

    const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/categories/:id — delete category (admin only)
router.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
