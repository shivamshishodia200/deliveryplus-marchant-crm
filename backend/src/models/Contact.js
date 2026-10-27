import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
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
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true
    },
    jobTitle: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    isPrimary: {
      type: Boolean,
      default: false
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

contactSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

export const Contact = mongoose.model('Contact', contactSchema);
