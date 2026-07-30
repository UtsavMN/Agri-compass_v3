require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to check if an event is "extreme/severe"
const isSevereWeather = (eventString) => {
  const severeKeywords = [
    'tornado', 'thunderstorm', 'flood', 'cyclone', 'hurricane', 
    'extreme heat', 'extreme cold', 'hail', 'tsunami', 'warning', 'severe'
  ];
  const lowerEvent = eventString.toLowerCase();
  return severeKeywords.some(keyword => lowerEvent.includes(keyword));
};

// Mock data generator for testing without an API key
const getMockAlerts = () => {
  const now = Math.floor(Date.now() / 1000);
  return [
    {
      alert_id: 'mock-alert-12345',
      event_type: 'Severe Thunderstorm Warning',
      description: 'A severe thunderstorm warning is in effect. Expect heavy rain, hail, and strong winds. Please secure your crops and equipment.',
      start: now - 3600, // started 1 hour ago
      end: now + 7200,   // ends in 2 hours
      is_active: true,
      sender: 'NWS'
    }
  ];
};

app.get('/api/weather-alerts', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return res.json({ alerts: getMockAlerts() });
  }

  try {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&exclude=current,minutely,hourly,daily`;
    const response = await axios.get(url);
    const data = response.data;

    let severeAlerts = [];

    if (data.alerts && data.alerts.length > 0) {
      const currentTime = Math.floor(Date.now() / 1000);

      severeAlerts = data.alerts
        .filter(alert => isSevereWeather(alert.event))
        .map(alert => {
          const alert_id = crypto.createHash('md5').update(`${alert.event}-${alert.start}`).digest('hex');
          return {
            alert_id,
            event_type: alert.event,
            description: alert.description,
            start: alert.start,
            end: alert.end,
            sender: alert.sender_name,
            is_active: currentTime >= alert.start && currentTime <= alert.end
          };
        });
    }

    res.json({ alerts: severeAlerts });
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    if (error.response && error.response.status === 401) {
      return res.json({ alerts: getMockAlerts() });
    }
    res.status(500).json({ error: 'Failed to fetch weather alerts' });
  }
});

// --- SETTINGS MOCK STORE ---
// We simulate a MongoDB collection in memory so the frontend works locally
const mockSettingsDb = new Map();

app.get('/api/settings', (req, res) => {
  // In a real app we'd use req.user.id from authentication middleware
  const userId = req.headers['x-user-id'] || 'default-user-id';
  let userSettings = mockSettingsDb.get(userId);
  
  if (!userSettings) {
    // Return default settings
    userSettings = {
      userId,
      highContrastMode: false,
      landUnit: 'Acre',
      weightUnit: 'Kg',
      voiceReadout: false,
      pushNotifications: true,
      smsAlertLevel: 'Critical Weather Only',
      quietHours: { enabled: false, start: '22:00', end: '06:00' },
      offlineDataSaver: false,
      location: { district: '', lat: 0, lng: 0 }
    };
    mockSettingsDb.set(userId, userSettings);
  }
  
  res.json(userSettings);
});

app.put('/api/settings', (req, res) => {
  const userId = req.headers['x-user-id'] || 'default-user-id';
  try {
    // Validate request body using Mongoose Schema (simulate DB validation)
    const settingsDoc = new Settings({ ...req.body, userId });
    const validationError = settingsDoc.validateSync();
    
    if (validationError) {
      return res.status(400).json({ error: 'Validation failed', details: validationError.errors });
    }

    // Save to our mock DB
    const updatedSettings = settingsDoc.toObject();
    mockSettingsDb.set(userId, updatedSettings);

    res.json({ message: 'Settings updated successfully', settings: updatedSettings });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.listen(PORT, () => {
  console.log(`Weather Alert Service & Settings API running on port ${PORT}`);
});
