require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  const user = await db.collection('users').findOne({ name: 'gaurav Munda' });
  
  // generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });

  try {
    const res = await axios.get('http://localhost:5000/api/technicians/me/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('API Error:', err.response?.data || err.message);
  }

  process.exit();
}

test();
