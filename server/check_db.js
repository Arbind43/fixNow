require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  const user = await db.collection('users').findOne({ name: 'gaurav Munda' });
  if (user) {
    console.log('User found:', user._id);
    const profile = await db.collection('technicianprofiles').findOne({ user: user._id });
    console.log('Profile:', JSON.stringify(profile, null, 2));
  } else {
    console.log('User not found');
  }
  process.exit();
}

check();
