// ============================================
// FixNow AI - Global TypeScript Types
// ============================================

export type UserRole = 'customer' | 'technician' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Technician {
  _id: string;
  userId: User;
  categories: Category[];
  experience: number;
  certificates: Certificate[];
  aadhaarVerified: boolean;
  serviceRadius: number;
  languages: string[];
  pricing: Record<string, number>;
  availability: boolean;
  isVerified: boolean;
  isOnline: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  completedJobs: number;
  avgRating: number;
  totalReviews: number;
  badges: SkillBadge[];
  bio?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image?: string;
  isActive: boolean;
  serviceCount: number;
}

export interface Service {
  _id: string;
  category: Category;
  name: string;
  description: string;
  basePrice: number;
  duration: number;
  image?: string;
  isActive: boolean;
}

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'assigned'
  | 'on_the_way'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'upi' | 'card' | 'wallet' | 'cod';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Booking {
  _id: string;
  customer: User;
  technician: Technician;
  service: Service;
  status: BookingStatus;
  scheduledDate: string;
  timeSlot: string;
  address: Address;
  notes?: string;
  isEmergency: boolean;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  beforeImages: string[];
  afterImages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Review {
  _id: string;
  booking: string;
  reviewer: User;
  technician: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

export interface Certificate {
  _id: string;
  name: string;
  issuedBy: string;
  imageUrl: string;
  verifiedByAdmin: boolean;
}

export interface SkillBadge {
  _id: string;
  name: string;
  icon: string;
  level: 'verified' | 'expert' | 'master';
}

export interface ChatMessage {
  _id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  readAt?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: 'booking' | 'payment' | 'chat' | 'system' | 'promotion';
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

export interface Invoice {
  _id: string;
  bookingId: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  pdfUrl?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Wallet {
  _id: string;
  userId: string;
  balance: number;
  currency: string;
}

export interface Transaction {
  _id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
