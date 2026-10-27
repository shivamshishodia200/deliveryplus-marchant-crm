import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product or service name is required'],
      trim: true
    },
    sku: {
      type: String,
      required: [true, 'SKU code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    category: {
      type: String,
      default: 'Enterprise Software'
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: 0
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    description: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Product = mongoose.model('Product', productSchema);
