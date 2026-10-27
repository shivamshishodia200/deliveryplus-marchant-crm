import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true
    },
    industry: {
      type: String,
      default: 'Logistics'
    },
    website: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'USA' }
    },
    annualRevenue: {
      type: Number,
      default: 0
    },
    employeeCount: {
      type: Number,
      default: 1
    },
    tier: {
      type: String,
      enum: ['standard', 'silver', 'gold', 'platinum'],
      default: 'standard'
    },
    status: {
      type: String,
      enum: ['prospect', 'active_client', 'inactive', 'churned'],
      default: 'prospect'
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
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

companySchema.index({ name: 'text', industry: 'text' });

export const Company = mongoose.model('Company', companySchema);
