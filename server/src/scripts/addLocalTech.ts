import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Models
import { User } from '../models/User';
import { ServiceCategory } from '../models/ServiceCategory';
import { Service } from '../models/Service';
import { TechnicianProfile } from '../models/TechnicianProfile';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixnow';

const addLocalTech = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // Fetch all categories and services to assign to this super-tech
    const categories = await ServiceCategory.find({});
    const services = await Service.find({});

    console.log('🌱 Creating Local Technician...');
    const localTech = await User.create({
      name: 'Local Expert (Gazipur)',
      email: 'localexpert@example.com',
      phone: '9999988888',
      password: 'Password123!',
      role: 'technician',
      isVerified: true,
    });

    await TechnicianProfile.create({
      user: localTech._id,
      categories: categories.map(c => c._id),
      services: services.map(s => s._id),
      bio: 'I am a local expert based in East Delhi. I can reach your location very quickly!',
      experienceYears: 10,
      skills: ['All-rounder', 'Quick Response'],
      hourlyRate: 500,
      rating: 4.9,
      reviewCount: 120,
      isAvailable: true,
      address: { 
        street: '138, gazipur village Preet Vihar East Delhi Delhi India, 110096', 
        city: 'East Delhi', 
        state: 'Delhi', 
        pincode: '110096', 
        serviceRadiusKm: 50 // Large radius to ensure they are found 
      },
      verificationStatus: 'verified',
      // Approximate coordinates for Gazipur, East Delhi
      location: { type: 'Point', coordinates: [77.3278, 28.6258], address: '138, gazipur village Preet Vihar East Delhi Delhi India, 110096' },
    });

    console.log('🎉 Local technician added successfully!');
    console.log('Email: localexpert@example.com');
    console.log('Password: Password123!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add local tech:', error);
    process.exit(1);
  }
};

addLocalTech();
