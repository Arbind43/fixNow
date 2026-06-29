import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { TechnicianProfile } from './src/models/TechnicianProfile';
import { User } from './src/models/User';
import { Service } from './src/models/Service';
import { ServiceCategory } from './src/models/ServiceCategory';

dotenv.config({ path: '../.env' });

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fixnow';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected...');

    // ── 1. Ensure a ServiceCategory exists ──────────────────────────────
    let category = await ServiceCategory.findOne({ slug: 'home-appliances' });
    if (!category) {
      category = await ServiceCategory.create({
        name: 'Home Appliances',
        slug: 'home-appliances',
        description: 'AC, washing machine, refrigerator and more',
        icon: 'Wrench',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        isActive: true,
      });
      console.log('📦 Created ServiceCategory: Home Appliances');
    } else {
      console.log('📦 ServiceCategory already exists. Skipping.');
    }

    // ── 2. Ensure a Service exists ────────────────────────────────────────
    let service = await Service.findOne({ slug: 'ac-regular-servicing' });
    if (!service) {
      service = await Service.create({
        category: category._id,
        name: 'AC Regular Servicing',
        slug: 'ac-regular-servicing',
        description: 'Complete AC cleaning, gas refilling check, and performance testing.',
        basePrice: 499,
        estimatedDuration: 60,
        isActive: true,
        features: ['Filter cleaning', 'Coil cleaning', 'Gas pressure check', 'Performance test'],
      });
      console.log(`🔧 Created Service: ${service.name} (ID: ${service._id})`);
    } else {
      console.log(`🔧 Service already exists: ${service.name} (ID: ${service._id})`);
    }

    // ── 3. Ensure a Technician exists with a proper location ────────────
    const baseLng = 77.2167;
    const baseLat = 28.6328;

    let technicians = await TechnicianProfile.find();

    if (technicians.length === 0) {
      console.log('👷 No technicians found! Creating a mock technician...');

      const mockUser = await User.create({
        name: 'Amit Sharma (Pro)',
        email: `amit.sharma${Date.now()}@fixnow.com`,
        password: 'password123',
        role: 'technician',
        phone: '9876543210',
      });

      const newTech = await TechnicianProfile.create({
        user: mockUser._id,
        services: [service._id],
        categories: [category._id],
        bio: 'Expert in AC and Appliance repair with 5 years experience.',
        experienceYears: 5,
        hourlyRate: 500,
        isAvailable: true,
        verificationStatus: 'verified',
        location: {
          type: 'Point',
          coordinates: [baseLng, baseLat],
          address: 'Connaught Place, New Delhi',
        },
      });

      console.log(`👷 Created Technician: Amit Sharma (ID: ${newTech._id})`);
    } else {
      console.log(`👷 Found ${technicians.length} technician(s). Updating location + service link...`);
      for (const tech of technicians) {
        const randomLngOffset = (Math.random() - 0.5) * 0.05;
        const randomLatOffset = (Math.random() - 0.5) * 0.05;

        tech.location = {
          type: 'Point',
          coordinates: [baseLng + randomLngOffset, baseLat + randomLatOffset],
          address: 'New Delhi',
        };
        tech.isAvailable = true;

        // Link service & category if not already linked
        if (!tech.services.map(String).includes(String(service._id))) {
          tech.services.push(service._id as any);
        }
        if (!tech.categories.map(String).includes(String(category._id))) {
          tech.categories.push(category._id as any);
        }

        await tech.save();
        console.log(`👷 Updated Technician ID: ${tech._id}`);
      }
    }

    console.log('\n🎉 DATABASE SEED COMPLETE!');
    console.log(`\n📌 Service ID to test with: ${service._id}`);
    console.log('   Copy this into your booking URL or state.\n');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error during seed:', error.message);
    process.exit(1);
  }
};

seed();
