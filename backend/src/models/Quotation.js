import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lineTotal: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    quoteNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity'
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
      default: 'draft'
    },
    items: [lineItemSchema],
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    taxRatePercent: {
      type: Number,
      default: 5
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    terms: {
      type: String,
      default: 'Standard delivery and logistics service terms apply. Payment due within 30 days.'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

export const Quotation = mongoose.model('Quotation', quotationSchema);
