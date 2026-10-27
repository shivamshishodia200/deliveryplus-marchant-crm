import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const merchantSchema = new mongoose.Schema(
  {
    merchantName: {
      type: String,
      required: [true, 'Merchant business name is required'],
      trim: true,
      index: true
    },
    merchantCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
      index: true
    },
    loginEmail: {
      type: String,
      required: [true, 'Merchant login email is required'],
      lowercase: true,
      trim: true,
      unique: true,
      index: true
    },
    passwordHash: {
      type: String,
      select: false
    },
    linkToTeam: {
      type: String,
      enum: ['All Teams', 'Merchants', 'Drivers', 'Office'],
      default: 'All Teams'
    },
    storeDetails: {
      contactName: { type: String, default: '' },
      phone: { type: String, default: '' },
      contactEmail: { type: String, default: '' },
      address: { type: String, default: '' },
      buildingUnit: { type: String, default: '' },
      instructions: { type: String, default: '' },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    permissions: {
      create_task: { type: Boolean, default: true },
      upload_task: { type: Boolean, default: true },
      view_shipping_fee: { type: Boolean, default: true },
      edit_contact: { type: Boolean, default: true },
      edit_task: { type: Boolean, default: true },
      assign_task_to_driver: { type: Boolean, default: false },
      edit_shipping_fee: { type: Boolean, default: false },
      delete_contact: { type: Boolean, default: false },
      delete_task: { type: Boolean, default: false },
      print_shipping_label: { type: Boolean, default: true },
      add_contact: { type: Boolean, default: true },
      manage_product: { type: Boolean, default: true }
    },
    storeOpeningHours: {
      enabled: { type: Boolean, default: false },
      schedule: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    logoUrl: {
      type: String,
      default: ''
    },
    sendWelcomeEmail: {
      type: Boolean,
      default: true
    },
    accountManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Method to verify password for Merchant Portal login
merchantSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const Merchant = mongoose.model('Merchant', merchantSchema);
