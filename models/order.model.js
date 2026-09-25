import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: { type: String },
  productId: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  regularPrice: { type: Number },
  quantity: { type: Number, required: true, default: 1 }
});

const orderSchema = new mongoose.Schema({
  customer: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 200 },
  grandTotal: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    default: 'Cash on Delivery'
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
