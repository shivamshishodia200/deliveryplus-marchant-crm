import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    companyName: {
      type: String,
      trim: true,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'unqualified', 'converted'],
      default: 'new',
      index: true
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'cold_call', 'social', 'advertisement', 'event', 'other'],
      default: 'website'
    },
    leadScore: {
      type: Number,
      default: 15
    },
    estimatedValue: {
      type: Number,
      default: 0
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    isConverted: {
      type: Boolean,
      default: false
    },
    convertedAt: {
      type: Date
    },
    convertedContactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    convertedCompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    convertedOpportunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity'
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

leadSchema.index({ firstName: 'text', lastName: 'text', companyName: 'text', email: 'text' });
leadSchema.index({ owner: 1, status: 1, createdAt: -1 });

export const Lead = mongoose.model('Lead', leadSchema);
