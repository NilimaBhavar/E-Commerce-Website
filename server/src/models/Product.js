const mongoose = require('mongoose');

// Product schema - items sold in the store
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: String,
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
    },
    // Reference to Category - stores the Category _id
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: String,
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    images: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        // Flatten category info
        if (ret.category && typeof ret.category === 'object') {
          ret.categoryId = ret.category._id
            ? ret.category._id.toString()
            : ret.category.toString();
          ret.categoryName = ret.category.name || '';
        } else if (ret.category) {
          ret.categoryId = ret.category.toString();
          ret.categoryName = '';
        }
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
