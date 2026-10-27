import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    body: {
      type: String,
      required: true
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_on_client', 'resolved', 'closed'],
      default: 'open',
      index: true
    },
    category: {
      type: String,
      enum: ['technical', 'billing', 'account', 'feature_request', 'general'],
      default: 'technical'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    comments: [commentSchema],
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
