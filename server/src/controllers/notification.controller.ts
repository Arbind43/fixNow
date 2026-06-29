import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await Notification.find({ user: req.user?.id })
      .sort('-createdAt')
      .limit(50); // limit to recent 50

    const unreadCount = await Notification.countDocuments({ user: req.user?.id, read: false });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (id === 'all') {
      await Notification.updateMany(
        { user: req.user?.id, read: false },
        { read: true }
      );
    } else {
      await Notification.findOneAndUpdate(
        { _id: id, user: req.user?.id },
        { read: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Notification(s) marked as read',
    });
  } catch (error) {
    next(error);
  }
};
