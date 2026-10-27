import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    relatedType: {
      type: String,
      enum: ['Lead', 'Contact', 'Company', 'Opportunity', 'General'],
      default: 'General'
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });

export const Task = mongoose.model('Task', taskSchema);
