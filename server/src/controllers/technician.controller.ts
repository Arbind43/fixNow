import { Request, Response, NextFunction } from 'express';
import { TechnicianProfile } from '../models/TechnicianProfile';
import { AppError } from '../utils/AppError';
import { User } from '../models/User';
import mongoose from 'mongoose';

export const getTechnicians = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat       = req.query.lat       ? parseFloat(req.query.lat as string)     : undefined;
    const lng       = req.query.lng       ? parseFloat(req.query.lng as string)     : undefined;
    const city      = req.query.city      as string | undefined;
    const pincode   = req.query.pincode   as string | undefined;
    const serviceId = req.query.service   as string | undefined;
    const search    = req.query.search    as string | undefined; // NEW: category/service name search

    let technicians: any[] = [];

    const baseQuery: any = { isAvailable: true, verificationStatus: 'verified' };
    if (serviceId && mongoose.Types.ObjectId.isValid(serviceId)) {
      baseQuery.services = new mongoose.Types.ObjectId(serviceId);
    }

    // ─── LAYER 1: GPS $geoNear (most accurate) ─────────────────────────────
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      try {
        const geoResults = await TechnicianProfile.aggregate([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [lng, lat] },
              distanceField: 'calculatedDistance',
              spherical: true,
              query: baseQuery,
              maxDistance: 100000 // 100 km hard cap
            }
          },
          {
            $addFields: {
              distanceInKm: { $divide: ['$calculatedDistance', 1000] },
              radiusLimit:  { $ifNull: ['$address.serviceRadiusKm', 50] }
            }
          },
          {
            $match: {
              $expr: { $lte: ['$distanceInKm', '$radiusLimit'] }
            }
          },
          { $sort: { calculatedDistance: 1 } },
          { $limit: 20 }
        ]);

        technicians = await TechnicianProfile.populate(geoResults, [
          { path: 'user', select: 'name avatar' },
          { path: 'categories', select: 'name slug' },
          { path: 'services', select: 'name slug' }
        ]);
      } catch (geoErr) {
        console.warn('[TechSearch] $geoNear failed (technicians may lack coordinates), trying city/pincode match.', geoErr);
      }
    }

    // ─── LAYER 2: City / Pincode text match ─────────────────────────────────
    if (technicians.length === 0 && (city || pincode)) {
      const textFilter: any = { ...baseQuery };
      const orClauses: any[] = [];
      if (city)    orClauses.push({ 'address.city':    { $regex: city,    $options: 'i' } });
      if (pincode) orClauses.push({ 'address.pincode': { $regex: pincode, $options: 'i' } });
      if (orClauses.length) textFilter.$or = orClauses;

      technicians = await TechnicianProfile.find(textFilter)
        .populate('user', 'name avatar')
        .populate('categories', 'name slug')
        .populate('services', 'name slug')
        .lean();
    }

    // ─── LAYER 3: All verified technicians (last resort) ────────────────────
    if (technicians.length === 0) {
      technicians = await TechnicianProfile.find(baseQuery)
        .populate('user', 'name avatar')
        .populate('categories', 'name slug')
        .populate('services', 'name slug')
        .lean();
    }

    // ─── POST-FILTER: category / service name keyword search ────────────────
    if (search && search.trim()) {
      const keywords = search.toLowerCase().trim().split(/\s+/);
      technicians = technicians.filter((t: any) => {
        const catNames  = (t.categories || []).map((c: any) => (c.name || '').toLowerCase()).join(' ');
        const svcNames  = (t.services   || []).map((s: any) => (s.name || '').toLowerCase()).join(' ');
        const userName  = (t.user?.name || '').toLowerCase();
        const searchStr = `${catNames} ${svcNames} ${userName}`;
        return keywords.some((kw: string) => searchStr.includes(kw));
      });
    }

    res.status(200).json({ success: true, count: technicians.length, data: technicians });
  } catch (error) {
    next(error);
  }
};

export const getTechnicianById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const technician = await TechnicianProfile.findById(req.params.id)
      .populate('user', 'name avatar createdAt')
      .populate('categories', 'name slug')
      .populate('services', 'name slug basePrice estimatedDuration')
      .lean();

    if (!technician) {
      return next(new AppError('Technician not found', 404));
    }

    res.status(200).json({
      success: true,
      data: technician,
    });
  } catch (error) {
    next(error);
  }
};

// Technician only routes
export const updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, personalDetails, address, banking, pricing, availability, ...rest } = req.body;

    // Update User model if name or phone is provided
    if (name || phone) {
      await User.findByIdAndUpdate(req.user?.id, { name, phone }, { new: true, runValidators: true });
    }

    // Build a $set payload using dot-notation so nested sub-documents are merged,
    // not overwritten.
    const $set: Record<string, any> = { ...rest };

    if (personalDetails) {
      if (personalDetails.dob    !== undefined) $set['personalDetails.dob']    = personalDetails.dob;
      if (personalDetails.gender !== undefined) $set['personalDetails.gender'] = personalDetails.gender;
    }

    if (address) {
      if (address.street           !== undefined) $set['address.street']           = address.street;
      if (address.city             !== undefined) $set['address.city']             = address.city;
      if (address.state            !== undefined) $set['address.state']            = address.state;
      if (address.pincode          !== undefined) $set['address.pincode']          = address.pincode;
      if (address.serviceRadiusKm  !== undefined) $set['address.serviceRadiusKm']  = address.serviceRadiusKm;

      // Auto-geocode city+state if no explicit coordinates provided
      if ((address.city || address.state) && !address.latitude) {
        try {
          const query = encodeURIComponent(`${address.city || ''} ${address.state || ''} India`);
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
            headers: { 'User-Agent': 'FixNow-App/1.0' }
          });
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            $set['location.type'] = 'Point';
            $set['location.coordinates'] = [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)];
            $set['location.address'] = `${address.city}, ${address.state}`;
          }
        } catch (geocodeErr) {
          console.warn('Auto-geocode failed for city:', geocodeErr);
        }
      }
    }

    if (banking) {
      if (banking.accountHolderName !== undefined) $set['banking.accountHolderName'] = banking.accountHolderName;
      if (banking.bankName          !== undefined) $set['banking.bankName']          = banking.bankName;
      if (banking.accountNumber     !== undefined) $set['banking.accountNumber']     = banking.accountNumber;
      if (banking.ifscCode          !== undefined) $set['banking.ifscCode']          = banking.ifscCode;
      if (banking.upiId             !== undefined) $set['banking.upiId']             = banking.upiId;
    }

    if (pricing) {
      if (pricing.baseCharge        !== undefined) $set['pricing.baseCharge']        = pricing.baseCharge;
      if (pricing.inspectionCharge  !== undefined) $set['pricing.inspectionCharge']  = pricing.inspectionCharge;
      if (pricing.emergencyCharge   !== undefined) $set['pricing.emergencyCharge']   = pricing.emergencyCharge;
    }

    if (availability) {
      if (availability.workingDays         !== undefined) $set['availability.workingDays']         = availability.workingDays;
      if (availability.startTime           !== undefined) $set['availability.startTime']           = availability.startTime;
      if (availability.endTime             !== undefined) $set['availability.endTime']             = availability.endTime;
      if (availability.emergencyAvailable  !== undefined) $set['availability.emergencyAvailable']  = availability.emergencyAvailable;
    }

    let profile = await TechnicianProfile.findOneAndUpdate(
      { user: req.user?.id },
      { $set },
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};


export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("FETCHING PROFILE FOR", req.user?.id);
    const profile = await TechnicianProfile.findOne({ user: req.user?.id })
      .populate('categories', 'name')
      .populate('services', 'name');

    if (!profile) {
      return next(new AppError('Profile not found', 404));
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
