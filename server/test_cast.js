require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Need to load the model
const { Schema, Types, model } = mongoose;

const technicianProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    personalDetails: { dob: String, gender: String }
  },
  { collection: 'technicianprofiles' }
);
const TechnicianProfile = model('TechnicianProfile', technicianProfileSchema);

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection;
  const user = await db.collection('users').findOne({ name: 'gaurav Munda' });
  
  const p1 = await TechnicianProfile.findOne({ user: user._id });
  const p2 = await TechnicianProfile.findOne({ user: user._id.toString() });
  const p3 = await TechnicianProfile.findOne({ user: user.id }); // undefined on raw driver, but req.user.id has it

  console.log('Using ObjectId:', !!p1);
  console.log('Using string:', !!p2);

  process.exit();
}

test();
