import mongoose, { Schema, Document, Types } from 'mongoose';

export type AuditAction =
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT'
  | 'APPROVE_TECHNICIAN'
  | 'REJECT_TECHNICIAN'
  | 'SUSPEND_USER'
  | 'UNSUSPEND_USER'
  | 'BAN_USER'
  | 'UNBAN_USER'
  | 'DELETE_USER'
  | 'SUSPEND_TECHNICIAN'
  | 'ACTIVATE_TECHNICIAN'
  | 'DELETE_TECHNICIAN'
  | 'CANCEL_BOOKING'
  | 'ASSIGN_BOOKING'
  | 'COMPLETE_BOOKING'
  | 'RESOLVE_COMPLAINT'
  | 'CLOSE_COMPLAINT'
  | 'REJECT_COMPLAINT'
  | 'HIDE_REVIEW'
  | 'DELETE_REVIEW'
  | 'UPDATE_SETTINGS'
  | 'CREATE_CATEGORY'
  | 'UPDATE_CATEGORY'
  | 'DELETE_CATEGORY'
  | 'CREATE_SERVICE'
  | 'UPDATE_SERVICE'
  | 'DELETE_SERVICE'
  | 'SEND_NOTIFICATION'
  | 'REQUEST_ADDITIONAL_DOCS'
  | 'ADD_VERIFICATION_NOTE';

export interface IAuditLog extends Document {
  admin: Types.ObjectId;
  adminName: string;
  action: AuditAction;
  targetId?: string;
  targetType?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'ADMIN_LOGIN', 'ADMIN_LOGOUT', 'APPROVE_TECHNICIAN', 'REJECT_TECHNICIAN',
        'SUSPEND_USER', 'UNSUSPEND_USER', 'BAN_USER', 'UNBAN_USER', 'DELETE_USER',
        'SUSPEND_TECHNICIAN', 'ACTIVATE_TECHNICIAN', 'DELETE_TECHNICIAN',
        'CANCEL_BOOKING', 'ASSIGN_BOOKING', 'COMPLETE_BOOKING',
        'RESOLVE_COMPLAINT', 'CLOSE_COMPLAINT', 'REJECT_COMPLAINT',
        'HIDE_REVIEW', 'DELETE_REVIEW', 'UPDATE_SETTINGS',
        'CREATE_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY',
        'CREATE_SERVICE', 'UPDATE_SERVICE', 'DELETE_SERVICE',
        'SEND_NOTIFICATION', 'REQUEST_ADDITIONAL_DOCS', 'ADD_VERIFICATION_NOTE',
      ],
    },
    targetId: { type: String },
    targetType: { type: String },
    details: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: true,
  }
);

// TTL index: keep logs for 1 year
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
