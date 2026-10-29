import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleName: {
      type: String,
      required: [true, 'Vehicle name is required'],
      trim: true
    },
    rego: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    vehicleType: {
      type: String,
      enum: ['Van', 'Truck', 'Ute', 'Semi-Trailer'],
      default: 'Van'
    },
    capacityKg: {
      type: Number,
      default: 1500
    },
    capacityVolumeM3: {
      type: Number,
      default: 12
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    driverName: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Active', 'Maintenance', 'Inactive'],
      default: 'Active',
      index: true
    },
    odometerKm: {
      type: Number,
      default: 0
    },
    nextServiceDueKm: {
      type: Number,
      default: 10000
    },
    currentLocation: {
      lat: { type: Number, default: -37.8136 },
      lng: { type: Number, default: 144.9631 },
      updatedAt: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true
  }
);

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
