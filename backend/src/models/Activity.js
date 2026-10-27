import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['call', 'meeting', 'email', 'note', 'stage_change', 'status_update'],
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    durationMinutes: {
      type: Number,
      default: 0
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      index: true
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      index: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      index: true
    }
  },
  {
    timestamps: true
  }
);

activitySchema.index({ createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema);
