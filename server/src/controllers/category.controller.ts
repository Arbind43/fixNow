import { Request, Response, NextFunction } from 'express';
import { ServiceCategory } from '../models/ServiceCategory';
import { AppError } from '../utils/AppError';

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true }).sort('name');
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await ServiceCategory.findOne({ slug: req.params.slug });
    
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Admin only routes
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await ServiceCategory.create(req.body);
    
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await ServiceCategory.findByIdAndUpdate(req.params.id, { isActive: false });
    
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    res.status(204).json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
