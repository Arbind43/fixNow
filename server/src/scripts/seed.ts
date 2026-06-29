import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Models
import { User, IUser } from '../models/User';
import { ServiceCategory } from '../models/ServiceCategory';
import { Service } from '../models/Service';
import { TechnicianProfile } from '../models/TechnicianProfile';
import { Booking } from '../models/Booking';
import { Message } from '../models/Message';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixnow';

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Clear existing data (optional, but good for a fresh seed)
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({ role: { $ne: 'admin' } }); // Keep admins
    await ServiceCategory.deleteMany({});
    await Service.deleteMany({});
    await TechnicianProfile.deleteMany({});
    await Booking.deleteMany({});
    await Message.deleteMany({});
    console.log('✅ Collections cleared.');

    // 2. Create Service Categories
    console.log('🌱 Seeding Categories...');
    const categoriesData = [
      { name: 'AC Repair', slug: 'ac-repair', description: 'Expert AC repair & maintenance', icon: 'Wind', image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=500&q=80', isActive: true },
      { name: 'Plumbing', slug: 'plumbing', description: 'Professional plumbing solutions', icon: 'Droplets', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80', isActive: true },
      { name: 'Electrical', slug: 'electrical', description: 'Safe electrical installations', icon: 'Zap', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80', isActive: true },
      { name: 'Cleaning', slug: 'cleaning', description: 'Deep home cleaning services', icon: 'Sparkles', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80', isActive: true },
      { name: 'Appliance Repair', slug: 'appliance-repair', description: 'Fix all home appliances', icon: 'Wrench', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80', isActive: true },
      { name: 'Painting', slug: 'painting', description: 'Interior and exterior painting', icon: 'Paintbrush', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&q=80', isActive: true },
      { name: 'Pest Control', slug: 'pest-control', description: 'Effective pest removal', icon: 'Shield', image: 'https://images.unsplash.com/photo-1585521551049-9c4c1a4ecf01?w=500&q=80', isActive: true },
      { name: 'Carpentry', slug: 'carpentry', description: 'Custom furniture & repairs', icon: 'Hammer', image: 'https://images.unsplash.com/photo-1596232537380-60627de3c46e?w=500&q=80', isActive: true },
      { name: 'Beauty & Salon', slug: 'beauty-salon', description: 'Home salon and grooming', icon: 'Scissors', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500&q=80', isActive: true },
      { name: 'RO & Water Purifier', slug: 'ro-water-purifier', description: 'RO service and repair', icon: 'Droplets', image: 'https://images.unsplash.com/photo-1563816999201-9a997d9e48c5?w=500&q=80', isActive: true },
      { name: 'Packers & Movers', slug: 'packers-movers', description: 'Safe home shifting', icon: 'Truck', image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=500&q=80', isActive: true },
      { name: 'Smart Home', slug: 'smart-home', description: 'Security cameras & smart devices', icon: 'Video', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=500&q=80', isActive: true },
      { name: 'Vehicle Repair', slug: 'vehicle-repair', description: 'Car & bike repair at home', icon: 'Car', image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=500&q=80', isActive: true },
      { name: 'IT Support', slug: 'it-support', description: 'Computer & network repairs', icon: 'Monitor', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80', isActive: true },
    ];
    const categories = await ServiceCategory.insertMany(categoriesData);

    // 3. Create Services
    console.log('🌱 Seeding Services...');
    const servicesData = [
      // AC Repair
      { category: categories[0]._id, name: 'AC Regular Service', slug: 'ac-regular-service', description: 'Basic AC cleaning and checkup', basePrice: 499, estimatedDuration: 60, features: ['Filter Cleaning', 'Gas Check'] },
      { category: categories[0]._id, name: 'AC Installation', slug: 'ac-installation', description: 'Complete AC installation', basePrice: 1499, estimatedDuration: 120, features: ['Mounting', 'Pipe connection'] },
      { category: categories[0]._id, name: 'AC Deep Clean', slug: 'ac-deep-clean', description: 'Jet pump thorough cleaning', basePrice: 899, estimatedDuration: 90, features: ['Jet Pump Clean', 'Coil Wash'] },
      
      // Plumbing
      { category: categories[1]._id, name: 'Tap Repair', slug: 'tap-repair', description: 'Fix leaking taps', basePrice: 199, estimatedDuration: 30, features: ['Leak Fix', 'Washer Replacement'] },
      { category: categories[1]._id, name: 'Pipe Installation', slug: 'pipe-installation', description: 'Install new pipes', basePrice: 899, estimatedDuration: 90, features: ['PVC Pipe Fitting'] },
      { category: categories[1]._id, name: 'Water Tank Cleaning', slug: 'water-tank-cleaning', description: 'Overhead tank cleaning', basePrice: 999, estimatedDuration: 120, features: ['Anti-Bacterial Wash'] },
      
      // Electrical
      { category: categories[2]._id, name: 'Switchboard Repair', slug: 'switchboard-repair', description: 'Fix faulty switches', basePrice: 249, estimatedDuration: 45, features: ['Wiring check', 'Switch replacement'] },
      { category: categories[2]._id, name: 'Fan Installation', slug: 'fan-installation', description: 'Ceiling fan mounting', basePrice: 349, estimatedDuration: 45, features: ['Mounting', 'Regulator connection'] },
      { category: categories[2]._id, name: 'MCB / Fuse Repair', slug: 'mcb-fuse-repair', description: 'Power tripping issues', basePrice: 449, estimatedDuration: 60, features: ['Fault Diagnosis', 'Replacement'] },
      
      // Cleaning
      { category: categories[3]._id, name: 'Full Home Deep Clean', slug: 'full-home-deep-clean', description: 'Comprehensive home cleaning', basePrice: 3499, estimatedDuration: 240, features: ['Floor Scrubbing', 'Bathroom Wash'] },
      { category: categories[3]._id, name: 'Sofa Cleaning', slug: 'sofa-cleaning', description: 'Fabric sofa shampoo', basePrice: 799, estimatedDuration: 90, features: ['Vacuuming', 'Shampoo Wash'] },
      
      // Appliance Repair
      { category: categories[4]._id, name: 'Washing Machine Repair', slug: 'washing-machine-repair', description: 'Fix all washing machine issues', basePrice: 599, estimatedDuration: 90, features: ['Motor Check', 'Drum Clean'] },
      { category: categories[4]._id, name: 'Refrigerator Repair', slug: 'fridge-repair', description: 'Fix cooling issues', basePrice: 699, estimatedDuration: 90, features: ['Gas Refill', 'Compressor Check'] },
      
      // Painting
      { category: categories[5]._id, name: '1 BHK Full Painting', slug: '1-bhk-painting', description: 'Complete flat painting', basePrice: 8999, estimatedDuration: 480, features: ['Wall Putty', '2 Coats Paint'] },
      { category: categories[5]._id, name: 'Touch Up Painting', slug: 'touch-up-painting', description: 'Minor wall touch ups', basePrice: 1499, estimatedDuration: 120, features: ['Crack Filling', 'Color Match'] },
      
      // Pest Control
      { category: categories[6]._id, name: 'General Pest Control', slug: 'general-pest-control', description: 'Cockroach & Ant treatment', basePrice: 999, estimatedDuration: 60, features: ['Gel Treatment', 'Spray'] },
      { category: categories[6]._id, name: 'Termite Control', slug: 'termite-control', description: 'Long lasting termite protection', basePrice: 2499, estimatedDuration: 120, features: ['Drill & Inject', 'Warranty'] },
      
      // Carpentry
      { category: categories[7]._id, name: 'Furniture Assembly', slug: 'furniture-assembly', description: 'Assemble IKEA/custom furniture', basePrice: 499, estimatedDuration: 60, features: ['Bed Assembly', 'Wardrobe setup'] },
      { category: categories[7]._id, name: 'Door Lock Repair', slug: 'door-lock-repair', description: 'Fix or replace door locks', basePrice: 349, estimatedDuration: 45, features: ['Lock Replacement'] },
      
      // Beauty & Salon
      { category: categories[8]._id, name: 'Men Haircut & Grooming', slug: 'men-haircut', description: 'Professional salon at home', basePrice: 399, estimatedDuration: 45, features: ['Haircut', 'Beard Trim'] },
      { category: categories[8]._id, name: 'Women Facial & Waxing', slug: 'women-facial-waxing', description: 'Complete beauty package', basePrice: 1299, estimatedDuration: 90, features: ['Fruit Facial', 'Full Body Wax'] },
      
      // RO
      { category: categories[9]._id, name: 'RO Filter Change', slug: 'ro-filter-change', description: 'Complete filter replacement', basePrice: 899, estimatedDuration: 45, features: ['Carbon Filter', 'Sediment Filter'] },
      { category: categories[9]._id, name: 'RO General Service', slug: 'ro-general-service', description: 'Routine RO maintenance', basePrice: 399, estimatedDuration: 30, features: ['TDS Check', 'Tank Clean'] },
      
      // Packers
      { category: categories[10]._id, name: 'Local Shifting (1 BHK)', slug: 'local-shifting-1bhk', description: 'Within city moving', basePrice: 4500, estimatedDuration: 360, features: ['Packing', 'Transport', 'Unpacking'] },
      
      // Smart Home
      { category: categories[11]._id, name: 'CCTV Installation', slug: 'cctv-installation', description: 'Security camera setup', basePrice: 999, estimatedDuration: 120, features: ['Wiring', 'DVR Setup'] },
      { category: categories[11]._id, name: 'Smart Lock Installation', slug: 'smart-lock-install', description: 'Biometric lock setup', basePrice: 799, estimatedDuration: 90, features: ['Door Drilling', 'App Setup'] },
      
      // Vehicle Repair
      { category: categories[12]._id, name: 'Car Breakdown Service', slug: 'car-breakdown', description: 'On-spot jumpstart and minor repairs', basePrice: 899, estimatedDuration: 60, features: ['Jumpstart', 'Diagnostics'] },
      { category: categories[12]._id, name: 'Bike Breakdown Service', slug: 'bike-breakdown', description: 'On-spot minor repairs & spark plug fix', basePrice: 499, estimatedDuration: 60, features: ['Diagnostics', 'Minor Repairs'] },
      { category: categories[12]._id, name: 'Flat Tire Fix', slug: 'flat-tire-fix', description: 'Puncture repair for cars/bikes', basePrice: 299, estimatedDuration: 30, features: ['Air Fill', 'Puncture Fix'] },
      
      // IT Support
      { category: categories[13]._id, name: 'PC Format & OS Install', slug: 'os-install', description: 'Windows/Mac OS Installation', basePrice: 499, estimatedDuration: 90, features: ['Data Backup', 'Driver Install'] },
      { category: categories[13]._id, name: 'Wi-Fi Network Setup', slug: 'wifi-setup', description: 'Router config and deadzone fix', basePrice: 349, estimatedDuration: 45, features: ['Router Config', 'Range Extension'] },
    ];
    const services = await Service.insertMany(servicesData);

    // 4. Create Customers
    console.log('🌱 Seeding Customers...');
    const customersData = Array.from({ length: 5 }).map((_, i) => ({
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `987654321${i}`,
      password: 'Password123!',
      role: 'customer' as const,
      isVerified: true,
    }));
    
    const customers = [];
    for (const custData of customersData) {
      customers.push(await User.create(custData));
    }

    // 5. Create Technicians & Profiles
    console.log('🌱 Seeding Technicians...');
    const techniciansData = Array.from({ length: 5 }).map((_, i) => ({
      name: `Technician ${i + 1}`,
      email: `tech${i + 1}@example.com`,
      phone: `876543210${i}`,
      password: 'Password123!',
      role: 'technician' as const,
      isVerified: true,
    }));

    const technicians = [];
    for (const techData of techniciansData) {
      technicians.push(await User.create(techData));
    }

    // Profiles for technicians
    for (let i = 0; i < technicians.length; i++) {
      await TechnicianProfile.create({
        user: technicians[i]._id,
        categories: [categories[i % categories.length]._id],
        services: [services[i % services.length]._id],
        bio: `Hi, I am an expert in ${categories[i % categories.length].name}. I provide reliable and quick service.`,
        experienceYears: 3 + i,
        skills: ['Professional', 'Punctual'],
        hourlyRate: 300 + (i * 50),
        rating: 4.5 + (i * 0.1),
        reviewCount: 15 + i,
        isAvailable: true,
        address: { street: '123 Main St', city: 'Metro City', state: 'State', pincode: '123456', serviceRadiusKm: 15 },
        verificationStatus: 'verified',
        location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Delhi, India' },
      });
    }

    // 6. Create Bookings
    console.log('🌱 Seeding Bookings...');
    const statuses: ('pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled')[] = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
    const bookings: any[] = [];
    for (let i = 0; i < 10; i++) {
      const customer = customers[i % customers.length];
      const technician = technicians[i % technicians.length];
      const service = services[i % services.length];

      bookings.push(await Booking.create({
        customer: customer._id,
        technician: (await TechnicianProfile.findOne({ user: technician._id }))?._id,
        service: service._id,
        status: statuses[i % statuses.length],
        paymentStatus: statuses[i % statuses.length] === 'completed' ? 'completed' : 'pending',
        scheduledDate: new Date(Date.now() + (i * 24 * 60 * 60 * 1000)), // Future dates
        address: { street: '456 Cust St', city: 'Metro City', state: 'State', zipCode: '123456', coordinates: [77.2, 28.6] },
        totalAmount: service.basePrice,
        notes: 'Please arrive on time.',
      }));
    }

    // 7. Create Messages
    console.log('🌱 Seeding Messages...');
    for (const booking of bookings.slice(0, 5)) {
      // Find technician user id from profile
      const techProfile = await TechnicianProfile.findById(booking.technician);
      if (techProfile) {
        await Message.create({
          sender: booking.customer,
          receiver: techProfile.user,
          booking: booking._id,
          content: 'Hello, when will you arrive?',
          read: true,
        });
        await Message.create({
          sender: techProfile.user,
          receiver: booking.customer,
          booking: booking._id,
          content: 'I will be there in 15 minutes!',
          read: false,
        });
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
