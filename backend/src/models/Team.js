import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    operatingRegion: {
      type: String,
      default: 'Melbourne Metro'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Team = mongoose.model('Team', teamSchema);
