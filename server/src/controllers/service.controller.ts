import { Request, Response, NextFunction } from 'express';
import { Service } from '../models/Service';
import { ServiceCategory } from '../models/ServiceCategory';
import { AppError } from '../utils/AppError';

export const getAllServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query = Service.find({ isActive: true }).populate('category', 'name slug icon');

    // Filter by category slug if provided
    if (req.query.category) {
      const category = await ServiceCategory.findOne({ slug: req.query.category as string });
      if (category) {
        query = query.where('category').equals(category._id);
      }
    }

    // Search by name
    if (req.query.search) {
      query = query.find({ name: { $regex: req.query.search as string, $options: 'i' } });
    }

    const services = await query.sort('name').lean();

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug }).populate('category', 'name slug icon').lean();
    
    if (!service) {
      return next(new AppError('Service not found', 404));
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// Admin only routes
export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.create(req.body);
    
    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!service) {
      return next(new AppError('Service not found', 404));
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};
