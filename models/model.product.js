import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    comment: { type: String, required: true }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    categoryLabel: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String},
    price50ml: { type: String, required: true },
    discountPrice50ml: { type: String , default: ''},
    price100ml: { type: String, required: true },
    discountPrice100ml: { type: String , default: ''},
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 0 },
    userReviews: [reviewSchema]
}, { timestamps: true });

export default mongoose.model('Product', productSchema);