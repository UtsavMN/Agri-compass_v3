const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  highContrastMode: {
    type: Boolean,
    default: false
  },
  landUnit: {
    type: String,
    enum: ['Acre', 'Hectare', 'Bigha'],
    default: 'Acre'
  },
  weightUnit: {
    type: String,
    enum: ['Quintal', 'Kg', 'Tonne', 'Bushel'],
    default: 'Kg'
  },
  voiceReadout: {
    type: Boolean,
    default: false
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  smsAlertLevel: {
    type: String,
    enum: ['All', 'Critical Weather Only', 'Off'],
    default: 'Critical Weather Only'
  },
  quietHours: {
    enabled: { type: Boolean, default: false },
    start: { type: String, default: '22:00' },
    end: { type: String, default: '06:00' }
  },
  offlineDataSaver: {
    type: Boolean,
    default: false
  },
  location: {
    district: { type: String, default: '' },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  }
}, { timestamps: true });

// We export the schema but won't strictly compile it to a live DB model if mongoose isn't connected
// For a fully working local mock without MongoDB, we can just use the schema for validation
// or fallback to an in-memory store in our controller.
let SettingsModel;
try {
  SettingsModel = mongoose.model('Settings', SettingsSchema);
} catch (error) {
  SettingsModel = mongoose.model('Settings');
}

module.exports = SettingsModel;
