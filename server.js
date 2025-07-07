const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;  // ✅ Handle Render dynamic port

app.use(express.json());
app.use(express.static(path.join(__dirname, 'Index')));

app.post('/log', async (req, res) => {
  const { name, email } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  console.log('🧪 Received POST to /log');
  console.log('🧪 Name:', name);
  console.log('🧪 Email:', email);
  console.log('🧪 IP:', ip);

  if (!name || !email) {
    console.log('❌ Missing name or email');
    return res.status(400).send('Missing name or email');
  }

  let locationInfo = '';
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    const data = response.data;

    if (data.status === 'success') {
      locationInfo = ` | Location: ${data.city}, ${data.regionName}, ${data.country} | ISP: ${data.isp}`;
    } else {
      locationInfo = ' | Location: Unknown';
    }
  } catch (error) {
    console.warn('⚠️ Failed to fetch geo info:', error.message);
    locationInfo = ' | Location: [Geo lookup failed]';
  }

  const logEntry = `${new Date().toISOString()} | Name: ${name}, Email: ${email}, IP: ${ip}${locationInfo}\n`;
  const logPath = path.join(__dirname, 'index', 'logins.txt');

  fs.appendFile(logPath, logEntry, (err) => {
    if (err) {
      console.error('❌ Failed to write to file:', err.message);
      return res.status(500).send('Logging failed');
    }

    console.log('✅ Logged:', logEntry.trim());
    res.send('Logged successfully');
  });
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Index', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
