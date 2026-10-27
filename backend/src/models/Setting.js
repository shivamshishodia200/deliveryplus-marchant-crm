import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      default: 'Nexus Enterprise CRM'
    },
    organizationLogo: {
      type: String,
      default: '/logo.svg'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    currencySymbol: {
      type: String,
      default: '$'
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    taxRatePercent: {
      type: Number,
      default: 5
    },
    pipelineStages: {
      type: [String],
      default: ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
    },
    leadStatuses: {
      type: [String],
      default: ['new', 'contacted', 'qualified', 'unqualified', 'converted']
    }
  },
  {
    timestamps: true
  }
);

export const Setting = mongoose.model('Setting', settingSchema);
