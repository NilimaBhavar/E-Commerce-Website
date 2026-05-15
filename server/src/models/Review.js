const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.userId = ret.user ? ret.user._id
          ? ret.user._id.toString()
          : ret.user.toString() : null;
        ret.productId = ret.product ? ret.product._id
          ? ret.product._id.toString()
          : ret.product.toString() : null;
        ret.userName = ret.user && ret.user.name ? ret.user.name : 'Anonymous';
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
