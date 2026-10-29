import mongoose from 'mongoose';

const driverProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    driverId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null
    },
    vehicleName: {
      type: String,
      default: ''
    },
    team: {
      type: String,
      default: 'Drivers'
    },
    capacity: {
      type: Number,
      default: 100
    },
    activeTasksCount: {
      type: Number,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    telemetry: {
      isOnline: { type: Boolean, default: false },
      lastSeen: { type: Date, default: null },
      lat: { type: Number, default: -37.8136 },
      lng: { type: Number, default: 144.9631 },
      speed: { type: Number, default: 0 },
      heading: { type: Number, default: 0 },
      battery: { type: Number, default: 100 }
    }
  },
  {
    timestamps: true
  }
);

export const DriverProfile = mongoose.model('DriverProfile', driverProfileSchema);
