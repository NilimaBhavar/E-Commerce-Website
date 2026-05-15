const mongoose = require('mongoose');

// Each item in an order (snapshot of product at time of purchase)
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    imageUrl: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: { type: String, default: 'cod' },
    paymentStatus: { type: String, default: 'pending' },
    shippingAddress: { type: String, required: true },
    city: String,
    state: String,
    pincode: String,
    notes: String,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        if (ret.user && typeof ret.user === 'object') {
          ret.userId = ret.user._id ? ret.user._id.toString() : ret.user.toString();
          ret.userName = ret.user.name || null;
        } else if (ret.user) {
          ret.userId = ret.user.toString();
        }
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
