import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { TechnicianProfile } from '../models/TechnicianProfile';
import { AppError } from '../utils/AppError';
import { generateAccessToken } from '../utils/jwt';
import { Service } from '../models/Service';

// ─── POST /api/technician/register ───────────────────────────────────────────
export const registerTechnician = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      // Step 1 - Basic
      fullName, email, phone, password,
      // Step 2 - Personal
      dob, gender,
      street, city, state, pincode, serviceRadiusKm,
      // Step 3 - Professional
      categoryId, experienceYears, skills, bio,
      // Step 5 - Banking
      accountHolderName, bankName, accountNumber, ifscCode, upiId,
      // Step 6 - Availability & Pricing
      workingDays, startTime, endTime, emergencyAvailable,
      baseCharge, inspectionCharge, emergencyCharge,
      // Coordinates (optional)
      longitude, latitude,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password) {
      return next(new AppError('Full name, email, phone and password are required', 400));
    }
    if (!street || !city || !state || !pincode) {
      return next(new AppError('Complete address is required', 400));
    }
    if (!categoryId) {
      return next(new AppError('Service category is required', 400));
    }

    // Check duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return next(new AppError('A user with this email or phone already exists', 409));
    }

    // Collect uploaded file paths
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const fileUrl = (field: string) =>
      files?.[field]?.[0]
        ? `/uploads/${files[field][0].filename}`
        : '';

    // Validate Aadhaar (mandatory document)
    if (!fileUrl('aadhaarCard')) {
      return next(new AppError('Aadhaar card upload is required', 400));
    }

    // 1. Create User
    const user = await User.create({
      name: fullName,
      email,
      phone,
      password,
      role: 'technician',
      avatar: fileUrl('profilePhoto'),
    });

    // 2. Fetch all services belonging to the selected category
    let assignedServices: any[] = [];
    if (categoryId) {
      const categoryServices = await Service.find({ category: categoryId }).select('_id');
      assignedServices = categoryServices.map(s => s._id);
    }

    // 3. Create TechnicianProfile
    const profile = await TechnicianProfile.create({
      user: user._id,
      categories: categoryId ? [categoryId] : [],
      services: assignedServices,

      personalDetails: { dob: dob || '', gender: gender || '' },

      address: {
        street: street || '',
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        serviceRadiusKm: Number(serviceRadiusKm) || 10,
      },

      bio: bio || '',
      experienceYears: Number(experienceYears) || 0,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
      hourlyRate: Number(baseCharge) || 0,

      location: {
        type: 'Point',
        coordinates: [
          Number(longitude) || 0,
          Number(latitude) || 0,
        ],
        address: `${city}, ${state}`,
      },

      documents: {
        profilePhoto:   fileUrl('profilePhoto'),
        aadhaarUrl:     fileUrl('aadhaarCard'),
        panUrl:         fileUrl('panCard'),
        licenseUrl:     fileUrl('drivingLicense'),
        certificateUrl: fileUrl('tradeCertificate'),
        portfolioUrls: (files?.['portfolioPhotos'] || []).map(
          (f: Express.Multer.File) => `/uploads/${f.filename}`
        ),
      },

      banking: {
        accountHolderName: accountHolderName || '',
        bankName:          bankName || '',
        accountNumber:     accountNumber || '',
        ifscCode:          ifscCode || '',
        upiId:             upiId || '',
      },

      availability: {
        workingDays: Array.isArray(workingDays)
          ? workingDays
          : (workingDays ? workingDays.split(',') : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
        startTime: startTime || '09:00',
        endTime:   endTime   || '18:00',
        emergencyAvailable: emergencyAvailable === 'true' || emergencyAvailable === true,
      },

      pricing: {
        baseCharge:       Number(baseCharge)       || 0,
        inspectionCharge: Number(inspectionCharge) || 0,
        emergencyCharge:  Number(emergencyCharge)  || 0,
      },

      verificationStatus: 'verified',
    });

    // 3. Return token so they're logged in right away
    const token = generateAccessToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful! You are now verified and can receive service assignments.',
      data: {
        token,
        user: {
          _id:  user._id,
          name: user.name,
          email: user.email,
          role:  user.role,
        },
        profile: { verificationStatus: profile.verificationStatus },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/technician/profile ─────────────────────────────────────────────
export const getMyTechnicianProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await TechnicianProfile.findOne({ user: req.user?.id })
      .populate('categories', 'name slug icon')
      .populate('services', 'name basePrice');

    if (!profile) return next(new AppError('Technician profile not found', 404));

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
