import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Opportunity title is required'],
      trim: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Associated company is required'],
      index: true
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    amount: {
      type: Number,
      required: [true, 'Deal amount is required'],
      default: 0,
      min: 0
    },
    stage: {
      type: String,
      enum: ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
      default: 'discovery',
      index: true
    },
    probability: {
      type: Number,
      default: 20,
      min: 0,
      max: 100
    },
    expectedCloseDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    lostReason: {
      type: String,
      default: ''
    },
    wonDate: {
      type: Date
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

opportunitySchema.index({ stage: 1, owner: 1, expectedCloseDate: 1 });

export const Opportunity = mongoose.model('Opportunity', opportunitySchema);
