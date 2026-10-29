import mongoose from 'mongoose';

const taskItemSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, default: '' },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    weightKg: { type: Number, min: 0, default: 0 },
    dimensions: {
      lengthCm: { type: Number, default: 0 },
      widthCm: { type: Number, default: 0 },
      heightCm: { type: Number, default: 0 }
    },
    unitPrice: { type: Number, min: 0, default: 0 }
  },
  { _id: true }
);

const attachmentSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    sizeBytes: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/octet-stream' },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { _id: true }
);

const taskEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    action: { type: String, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedByName: { type: String, default: 'System' },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  },
  { _id: true }
);

const deliveryTaskSchema = new mongoose.Schema(
  {
    taskNumber: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },
    externalReferenceId: {
      type: String,
      trim: true,
      default: '',
      index: true
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
      index: true
    },
    merchantName: {
      type: String,
      required: true,
      trim: true
    },
    taskType: {
      type: String,
      enum: ['Delivery', 'Pickup', 'Service'],
      default: 'Delivery',
      index: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    service: {
      type: String,
      default: 'Standard Delivery'
    },
    taskNotes: {
      type: String,
      default: ''
    },
    pickupLocation: {
      contactName: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    destination: {
      recipientName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, lowercase: true, trim: true, default: '' },
      notificationPreference: {
        type: String,
        enum: ['SMS', 'Email', 'Both', 'None'],
        default: 'SMS'
      },
      address: { type: String, required: true, trim: true },
      buildingUnit: { type: String, default: '' },
      instructions: { type: String, default: '' },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    completeBefore: {
      type: Date,
      required: true,
      index: true
    },
    completeAfter: {
      type: Date,
      default: null
    },
    assignedTeam: {
      type: String,
      default: 'All Teams',
      index: true
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    driverName: {
      type: String,
      default: null
    },
    completionRequirements: {
      photo: { type: Boolean, default: true },
      signature: { type: Boolean, default: true },
      notes: { type: Boolean, default: false }
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    serviceDurationMinutes: {
      type: Number,
      default: 30
    },
    configurableFields: {
      paperwork: { type: String, default: '' },
      pickedUpOrders: { type: String, default: '' },
      scheduledFor: { type: String, default: '' },
      remarks: { type: String, default: '' },
      teamMember: { type: String, default: '' }
    },
    items: [taskItemSchema],
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: [
        'Unassigned',
        'Assigning',
        'Assigned',
        'Processed',
        'Loaded',
        'Transit',
        'Arrived',
        'Completed',
        'Failed',
        'Cancelled'
      ],
      default: 'Unassigned',
      index: true
    },
    failureReason: {
      type: String,
      default: ''
    },
    completedAt: {
      type: Date,
      default: null
    },
    completionProof: {
      signatureUrl: { type: String, default: '' },
      photoUrl: { type: String, default: '' },
      notes: { type: String, default: '' },
      timestamp: { type: Date, default: null }
    },
    history: [taskEventSchema],
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    version: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for performant dashboard and workspace queries
deliveryTaskSchema.index({ merchant: 1, status: 1, completeBefore: 1 });
deliveryTaskSchema.index({ assignedDriver: 1, status: 1 });
deliveryTaskSchema.index({ isArchived: 1, status: 1, createdAt: -1 });

export const DeliveryTask = mongoose.model('DeliveryTask', deliveryTaskSchema);
