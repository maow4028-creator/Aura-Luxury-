export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: 'member' | 'admin';
  fitness_goals?: string;
  emergency_contact?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface MembershipPlan {
  id: number;
  name: string;
  duration_months: number;
  duration_label: string;
  price_inr: number;
  description: string;
  features: string[];
  popular_badge: number;
  is_active: number;
  sort_order: number;
}

export interface ActiveMembership {
  id: number;
  membership_code: string;
  member_name: string;
  member_email: string;
  member_phone?: string;
  plan_id: number;
  plan_name: string;
  price_inr: number;
  duration_label: string;
  start_date: string;
  expiry_date: string;
  formatted_start_date: string;
  formatted_expiry_date: string;
  remaining_days: number;
  progress_percentage: number;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  payment_status: 'PAID' | 'PENDING';
  receipt_number?: string;
  payment_gateway?: string;
  payment_date?: string;
  features: string[];
}

export interface MembershipHistoryItem {
  id: number;
  membership_code: string;
  plan_name: string;
  price_inr: number;
  start_date: string;
  expiry_date: string;
  formatted_start_date: string;
  formatted_expiry_date: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  receipt_number?: string;
  payment_status: string;
  payment_gateway?: string;
  payment_date?: string;
}

export interface Facility {
  id: number;
  title: string;
  category: string;
  description: string;
  image_url: string;
  features: string[];
  sort_order: number;
}

export interface Program {
  id: number;
  title: string;
  category: string;
  duration: string;
  difficulty: string;
  description: string;
  image_url: string;
  schedule_info: string;
  sort_order: number;
}

export interface Trainer {
  id: number;
  name: string;
  role: string;
  specialization: string;
  experience: string;
  bio: string;
  image_url: string;
  instagram?: string;
  sort_order: number;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image_url: string;
  description?: string;
}

export interface Testimonial {
  id: number;
  member_name: string;
  role_or_title: string;
  rating: number;
  review_text: string;
  image_url: string;
  is_featured: number;
}

export interface OpeningHour {
  id: number;
  day_of_week: string;
  open_time: string;
  close_time: string;
  is_closed: number;
}

export interface GymInfo {
  id: number;
  name: string;
  tagline: string;
  about_text: string;
  mission_text: string;
  vision_text: string;
  experience_years: number;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  map_embed_url: string;
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
}

export interface Booking {
  id: number;
  booking_code: string;
  user_id: number;
  plan_id: number;
  plan_name?: string;
  duration_label?: string;
  amount_inr: number;
  payment_method: 'razorpay' | 'offline';
  payment_status: 'PAID' | 'PENDING' | 'FAILED';
  booking_status: 'CONFIRMED' | 'PENDING_APPROVAL' | 'CANCELLED';
  admin_notes?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export interface ReceiptData {
  receipt_number: string;
  payment_date: string;
  amount_inr: number;
  payment_gateway: string;
  gateway_payment_id?: string;
  booking_code: string;
  membership_code: string;
  plan_name: string;
  start_date: string;
  expiry_date: string;
  member_name: string;
  member_email: string;
  member_phone?: string;
  status: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'SUCCESS' | 'WARNING' | 'INFO';
  is_read: number;
  created_at: string;
}
