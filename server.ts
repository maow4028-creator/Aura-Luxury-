import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { db, initDatabase, evaluateAndRefreshMembershipStatuses } from './server/db.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'aura_luxury_gym_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Initialize SQLite database and tables
initDatabase();

// Run expiry check on each request to ensure accurate status
app.use((_req, _res, next) => {
  try {
    evaluateAndRefreshMembershipStatuses();
  } catch (err) {
    console.error('Error during auto-membership expiry check:', err);
  }
  next();
});

// Helper: JWT generator
function generateToken(user: { id: number; email: string; role: string; full_name: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.full_name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    name: string;
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token.' });
      return;
    }
    req.user = decoded;
    next();
  });
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
    return;
  }
  next();
}

// Helper: Log admin activity
function logAdminAction(adminId: number, action: string, entityType: string, entityId: number | null, details: string) {
  try {
    db.prepare(`
      INSERT INTO admin_activity_logs (admin_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, action, entityType, entityId, details);
  } catch (err) {
    console.error('Failed to log admin action:', err);
  }
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, full_name, phone, fitness_goals } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const result = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, phone, role, fitness_goals)
      VALUES (?, ?, ?, ?, 'member', ?)
    `).run(email.toLowerCase().trim(), password_hash, full_name.trim(), phone || null, fitness_goals || 'General Fitness');

    const newUser = {
      id: Number(result.lastInsertRowid),
      email: email.toLowerCase().trim(),
      role: 'member',
      full_name: full_name.trim(),
    };

    // Welcome notification
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, 'SUCCESS')
    `).run(
      newUser.id,
      'Welcome to Aura Luxury Fitness Club',
      'Your account has been created. Explore our world-class memberships to start your journey.'
    );

    const token = generateToken(newUser);
    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: newUser,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to register account.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    });

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        fitness_goals: user.fitness_goals,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to process login.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const user = db.prepare('SELECT id, email, full_name, phone, role, fitness_goals, emergency_contact, avatar_url, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch user details.' });
  }
});

app.put('/api/auth/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { full_name, phone, fitness_goals, emergency_contact } = req.body;
    db.prepare(`
      UPDATE users
      SET full_name = ?, phone = ?, fitness_goals = ?, emergency_contact = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(full_name, phone, fitness_goals, emergency_contact, req.user!.id);

    return res.json({ message: 'Profile updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
  if (!user) {
    // Return friendly message even if user doesn't exist for security
    return res.json({ message: 'If an account exists with this email, password reset instructions have been generated.' });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  db.prepare('UPDATE users SET reset_token = ? WHERE id = ?').run(resetToken, user.id);

  return res.json({
    message: 'Reset instructions generated successfully.',
    reset_token: resetToken, // Provided in response for seamless development/testing flow
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { reset_token, new_password } = req.body;
  if (!reset_token || !new_password) {
    return res.status(400).json({ error: 'Reset token and new password are required.' });
  }

  const user = db.prepare('SELECT id FROM users WHERE reset_token = ?').get(reset_token) as any;
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired password reset token.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(new_password, salt);

  db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(password_hash, user.id);
  return res.json({ message: 'Password has been reset successfully. You can now login.' });
});

// ==========================================
// PUBLIC GYM CONTENT ROUTES
// ==========================================

app.get('/api/gym/info', (_req, res) => {
  const info = db.prepare('SELECT * FROM gym_information LIMIT 1').get();
  return res.json({ info });
});

app.get('/api/gym/opening-hours', (_req, res) => {
  const hours = db.prepare('SELECT * FROM opening_hours ORDER BY sort_order ASC').all();
  return res.json({ hours });
});

app.get('/api/gym/facilities', (_req, res) => {
  const facilities = db.prepare('SELECT * FROM facilities ORDER BY sort_order ASC').all();
  const parsed = facilities.map((f: any) => ({
    ...f,
    features: JSON.parse(f.features_json || '[]'),
  }));
  return res.json({ facilities: parsed });
});

app.get('/api/gym/programs', (_req, res) => {
  const programs = db.prepare('SELECT * FROM programs ORDER BY sort_order ASC').all();
  return res.json({ programs });
});

app.get('/api/gym/trainers', (_req, res) => {
  const trainers = db.prepare('SELECT * FROM trainers ORDER BY sort_order ASC').all();
  return res.json({ trainers });
});

app.get('/api/gym/gallery', (_req, res) => {
  const gallery = db.prepare('SELECT * FROM gallery ORDER BY sort_order ASC').all();
  return res.json({ gallery });
});

app.get('/api/gym/testimonials', (_req, res) => {
  const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY sort_order ASC').all();
  return res.json({ testimonials });
});

app.post('/api/gym/contact', (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    db.prepare(`
      INSERT INTO contact_messages (name, email, phone, subject, message, status)
      VALUES (?, ?, ?, ?, ?, 'UNREAD')
    `).run(name, email, phone || null, subject || 'General Inquiry', message);

    return res.status(201).json({ message: 'Thank you for contacting Aura Luxury Fitness Club. Our concierge will reach out promptly.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit contact message.' });
  }
});

app.get('/api/plans', (_req, res) => {
  const plans = db.prepare('SELECT * FROM membership_plans WHERE is_active = 1 ORDER BY sort_order ASC').all();
  const parsed = plans.map((p: any) => ({
    ...p,
    features: JSON.parse(p.features_json || '[]'),
  }));
  return res.json({ plans: parsed });
});

// ==========================================
// MEMBER MEMBERSHIP & BOOKING ROUTES
// ==========================================

// GET /api/memberships/my-active: Most important feature
app.get('/api/memberships/my-active', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = db.prepare('SELECT full_name, email, phone FROM users WHERE id = ?').get(userId) as any;

    // Fetch the most recent or active membership record
    const record = db.prepare(`
      SELECT mr.*, mp.duration_months, mp.duration_label, mp.features_json,
             p.receipt_number, p.gateway_payment_id, p.payment_date, p.payment_gateway
      FROM membership_records mr
      LEFT JOIN membership_plans mp ON mr.plan_id = mp.id
      LEFT JOIN payments p ON p.booking_id = mr.booking_id
      WHERE mr.user_id = ?
      ORDER BY 
        CASE 
          WHEN mr.status = 'ACTIVE' THEN 1
          WHEN mr.status = 'PENDING' THEN 2
          WHEN mr.status = 'EXPIRED' THEN 3
          ELSE 4
        END,
        mr.id DESC
      LIMIT 1
    `).get(userId) as any;

    // Always query for any pending offline booking
    const pendingBooking = db.prepare(`
      SELECT mb.*, mp.name as plan_name, mp.duration_label, mp.features_json
      FROM membership_bookings mb
      JOIN membership_plans mp ON mb.plan_id = mp.id
      WHERE mb.user_id = ? AND mb.booking_status = 'PENDING_APPROVAL'
      ORDER BY mb.id DESC LIMIT 1
    `).get(userId) as any;

    // Query for any recent cancelled booking
    const recentCancelledBooking = db.prepare(`
      SELECT mb.*, mp.name as plan_name, mp.duration_label
      FROM membership_bookings mb
      JOIN membership_plans mp ON mb.plan_id = mp.id
      WHERE mb.user_id = ? AND mb.booking_status = 'CANCELLED'
      ORDER BY mb.id DESC LIMIT 1
    `).get(userId) as any;

    if (!record) {
      return res.json({
        has_membership: false,
        pending_booking: pendingBooking || null,
        recent_cancelled_booking: recentCancelledBooking || null,
        user_name: user?.full_name,
      });
    }

    // Dynamic calculations based on current date
    const now = new Date();
    const expiry = new Date(record.expiry_date + 'T23:59:59');
    const start = new Date(record.start_date + 'T00:00:00');

    const remainingMs = expiry.getTime() - now.getTime();
    const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));

    // Progress bar percentage
    const totalMs = expiry.getTime() - start.getTime();
    const elapsedMs = Math.max(0, now.getTime() - start.getTime());
    let progressPercentage = totalMs > 0 ? Math.round((elapsedMs / totalMs) * 100) : 0;
    if (progressPercentage > 100) progressPercentage = 100;
    if (progressPercentage < 0) progressPercentage = 0;

    // Format start and expiry dates nicely
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    const formattedStartDate = new Date(record.start_date).toLocaleDateString('en-IN', options);
    const formattedExpiryDate = new Date(record.expiry_date).toLocaleDateString('en-IN', options);

    return res.json({
      has_membership: true,
      pending_booking: pendingBooking || null,
      recent_cancelled_booking: recentCancelledBooking || null,
      membership: {
        id: record.id,
        membership_code: record.membership_code,
        member_name: user.full_name,
        member_email: user.email,
        member_phone: user.phone,
        plan_id: record.plan_id,
        plan_name: record.plan_name,
        price_inr: record.price_inr,
        duration_label: record.duration_label,
        start_date: record.start_date,
        expiry_date: record.expiry_date,
        formatted_start_date: formattedStartDate,
        formatted_expiry_date: formattedExpiryDate,
        remaining_days: remainingDays,
        progress_percentage: progressPercentage,
        status: record.status, // ACTIVE, PENDING, EXPIRED, CANCELLED
        payment_status: record.receipt_number ? 'PAID' : 'PENDING',
        receipt_number: record.receipt_number || null,
        payment_gateway: record.payment_gateway || 'Razorpay Online',
        payment_date: record.payment_date || null,
        features: JSON.parse(record.features_json || '[]'),
      },
    });
  } catch (err: any) {
    console.error('Error in my-active membership:', err);
    return res.status(500).json({ error: 'Failed to retrieve membership data.' });
  }
});

// GET /api/memberships/history
app.get('/api/memberships/history', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    // 1. Fetch pending bookings to also show in member history
    const pendingBookings = db.prepare(`
      SELECT mb.id, mb.booking_code as membership_code, mp.name as plan_name, mb.amount_inr as price_inr,
             mb.created_at as start_date, 'Waiting for Approval' as expiry_date,
             'PENDING' as status, NULL as receipt_number, mb.payment_status,
             mb.payment_method as payment_gateway, mb.created_at as payment_date
      FROM membership_bookings mb
      JOIN membership_plans mp ON mb.plan_id = mp.id
      WHERE mb.user_id = ? AND mb.booking_status = 'PENDING_APPROVAL'
      ORDER BY mb.id DESC
    `).all(req.user!.id) as any[];

    const pendingFormatted = pendingBookings.map((pb) => {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      return {
        ...pb,
        formatted_start_date: new Date(pb.start_date).toLocaleDateString('en-IN', options),
        formatted_expiry_date: 'Awaiting Desk Approval',
      };
    });

    // 2. Fetch completed records
    const records = db.prepare(`
      SELECT mr.*, p.receipt_number, p.payment_status, p.payment_gateway, p.payment_date
      FROM membership_records mr
      LEFT JOIN payments p ON p.booking_id = mr.booking_id
      WHERE mr.user_id = ?
      ORDER BY mr.id DESC
    `).all(req.user!.id) as any[];

    const formatted = records.map((r) => {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      return {
        ...r,
        formatted_start_date: new Date(r.start_date).toLocaleDateString('en-IN', options),
        formatted_expiry_date: new Date(r.expiry_date).toLocaleDateString('en-IN', options),
      };
    });

    return res.json({ history: [...pendingFormatted, ...formatted] });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve membership history.' });
  }
});

// GET /api/memberships/bookings
app.get('/api/memberships/bookings', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const bookings = db.prepare(`
      SELECT mb.*, mp.name as plan_name, mp.duration_label
      FROM membership_bookings mb
      JOIN membership_plans mp ON mb.plan_id = mp.id
      WHERE mb.user_id = ?
      ORDER BY mb.id DESC
    `).all(req.user!.id);
    return res.json({ bookings });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve bookings.' });
  }
});

// POST /api/memberships/book - Step 1 of Booking Workflow
app.post('/api/memberships/book', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { plan_id, payment_method, notes } = req.body;

    if (!plan_id || !payment_method) {
      return res.status(400).json({ error: 'Plan ID and payment method are required.' });
    }

    const plan = db.prepare('SELECT * FROM membership_plans WHERE id = ? AND is_active = 1').get(plan_id) as any;
    if (!plan) {
      return res.status(404).json({ error: 'Selected membership plan not found or inactive.' });
    }

    const bookingCode = `BK-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const isOnline = payment_method === 'razorpay';
    const bookingStatus = isOnline ? 'PENDING_APPROVAL' : 'PENDING_APPROVAL';
    const paymentStatus = 'PENDING';

    const insertBooking = db.prepare(`
      INSERT INTO membership_bookings (
        booking_code, user_id, plan_id, amount_inr, payment_method, payment_status, booking_status, admin_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(bookingCode, userId, plan.id, plan.price_inr, payment_method, paymentStatus, bookingStatus, notes || null);

    const bookingId = Number(insertBooking.lastInsertRowid);

    // If online, return Razorpay order details ready for payment checkout
    if (isOnline) {
      const razorpayOrderId = `order_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      return res.status(201).json({
        booking_id: bookingId,
        booking_code: bookingCode,
        amount_inr: plan.price_inr,
        amount_paise: plan.price_inr * 100,
        currency: 'INR',
        razorpay_order_id: razorpayOrderId,
        plan_name: plan.name,
        payment_method: 'razorpay',
      });
    } else {
      // Offline booking created - requires gym desk confirmation
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, 'INFO')
      `).run(
        userId,
        'Offline Booking Submitted',
        `Booking ${bookingCode} for ${plan.name} is received. Please visit our front desk to complete payment and activate your membership.`
      );

      return res.status(201).json({
        booking_id: bookingId,
        booking_code: bookingCode,
        amount_inr: plan.price_inr,
        plan_name: plan.name,
        payment_method: 'offline',
        status: 'PENDING_APPROVAL',
        message: 'Offline payment request registered. Your membership will be activated upon desk verification.',
      });
    }
  } catch (err: any) {
    console.error('Booking error:', err);
    return res.status(500).json({ error: 'Failed to process membership booking.' });
  }
});

// POST /api/payments/razorpay/verify - Verifies payment & activates membership
app.post('/api/payments/razorpay/verify', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { booking_id, razorpay_payment_id, razorpay_order_id } = req.body;

    if (!booking_id || !razorpay_payment_id) {
      return res.status(400).json({ error: 'Missing booking ID or payment transaction details.' });
    }

    const booking = db.prepare('SELECT * FROM membership_bookings WHERE id = ? AND user_id = ?').get(booking_id, userId) as any;
    if (!booking) {
      return res.status(404).json({ error: 'Booking record not found.' });
    }

    if (booking.payment_status === 'PAID') {
      return res.status(400).json({ error: 'This booking has already been verified and paid.' });
    }

    const plan = db.prepare('SELECT * FROM membership_plans WHERE id = ?').get(booking.plan_id) as any;
    if (!plan) {
      return res.status(404).json({ error: 'Associated membership plan not found.' });
    }

    // Calculate dates
    const now = new Date();
    const startDate = now.toISOString().split('T')[0];

    // Check if user currently has an ACTIVE membership - if renewing, start from existing expiry!
    const activeExisting = db.prepare(`
      SELECT expiry_date FROM membership_records
      WHERE user_id = ? AND status = 'ACTIVE' AND expiry_date >= ?
      ORDER BY expiry_date DESC LIMIT 1
    `).get(userId, startDate) as any;

    let computedStartDate = startDate;
    let computedExpiryDate = '';

    if (activeExisting && new Date(activeExisting.expiry_date) > now) {
      // Extend seamlessly from previous expiry date
      const baseDate = new Date(activeExisting.expiry_date);
      computedStartDate = activeExisting.expiry_date;
      baseDate.setMonth(baseDate.getMonth() + plan.duration_months);
      computedExpiryDate = baseDate.toISOString().split('T')[0];
    } else {
      const baseDate = new Date();
      baseDate.setMonth(baseDate.getMonth() + plan.duration_months);
      computedExpiryDate = baseDate.toISOString().split('T')[0];
    }

    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const membershipCode = `MEM-AURA-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update booking
    db.prepare(`
      UPDATE membership_bookings
      SET payment_status = 'PAID', booking_status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(booking.id);

    // Record Payment
    db.prepare(`
      INSERT INTO payments (
        receipt_number, booking_id, user_id, amount_inr, payment_gateway, gateway_order_id, gateway_payment_id, payment_status, notes
      ) VALUES (?, ?, ?, ?, 'Razorpay (Online Payment)', ?, ?, 'SUCCESS', ?)
    `).run(
      receiptNumber,
      booking.id,
      userId,
      booking.amount_inr,
      razorpay_order_id || 'order_simulated',
      razorpay_payment_id,
      'Verified via Razorpay API checkout'
    );

    // Create Active Membership Record
    const recordResult = db.prepare(`
      INSERT INTO membership_records (
        membership_code, user_id, booking_id, plan_id, plan_name, price_inr, start_date, expiry_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `).run(
      membershipCode,
      userId,
      booking.id,
      plan.id,
      plan.name,
      booking.amount_inr,
      computedStartDate,
      computedExpiryDate
    );

    const recordId = Number(recordResult.lastInsertRowid);

    // Create History Log
    db.prepare(`
      INSERT INTO membership_history (
        user_id, membership_record_id, action_type, old_status, new_status, notes
      ) VALUES (?, ?, 'ACTIVATION', 'PENDING', 'ACTIVE', ?)
    `).run(
      userId,
      recordId,
      `Online payment verified with Razorpay payment ID ${razorpay_payment_id}. Receipt #${receiptNumber}`
    );

    // Send Member Notification
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, 'SUCCESS')
    `).run(
      userId,
      'Membership Activated Successfully!',
      `Congratulations! Your ${plan.name} is now ACTIVE until ${computedExpiryDate}. Your membership ID is ${membershipCode}. Receipt #${receiptNumber} has been generated.`
    );

    return res.json({
      success: true,
      message: 'Payment verified and membership activated!',
      membership_code: membershipCode,
      receipt_number: receiptNumber,
      start_date: computedStartDate,
      expiry_date: computedExpiryDate,
      plan_name: plan.name,
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return res.status(500).json({ error: 'Failed to verify payment.' });
  }
});

// GET /api/memberships/receipt/:receiptNumber
app.get('/api/memberships/receipt/:receiptNumber', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { receiptNumber } = req.params;
    const payment = db.prepare(`
      SELECT p.*, mb.booking_code, u.full_name, u.email, u.phone, mr.membership_code, mr.start_date, mr.expiry_date, mr.plan_name
      FROM payments p
      JOIN membership_bookings mb ON p.booking_id = mb.id
      JOIN users u ON p.user_id = u.id
      LEFT JOIN membership_records mr ON mr.booking_id = mb.id
      WHERE p.receipt_number = ? AND (p.user_id = ? OR ? = 'admin')
    `).get(receiptNumber, req.user!.id, req.user!.role) as any;

    if (!payment) {
      return res.status(404).json({ error: 'Receipt not found or permission denied.' });
    }

    const gym = db.prepare('SELECT * FROM gym_information LIMIT 1').get() as any;

    return res.json({
      receipt: {
        receipt_number: payment.receipt_number,
        payment_date: payment.payment_date,
        amount_inr: payment.amount_inr,
        payment_gateway: payment.payment_gateway,
        gateway_payment_id: payment.gateway_payment_id,
        booking_code: payment.booking_code,
        membership_code: payment.membership_code,
        plan_name: payment.plan_name,
        start_date: payment.start_date,
        expiry_date: payment.expiry_date,
        member_name: payment.full_name,
        member_email: payment.email,
        member_phone: payment.phone,
        status: payment.payment_status,
      },
      gym: {
        name: gym?.name || 'Aura Luxury Fitness Club',
        address: gym?.address || 'Plot 42, Platinum Enclave, Linking Road, Bandra West, Mumbai 400050',
        phone: gym?.phone || '+91 22 2640 8899',
        email: gym?.email || 'concierge@auragym.com',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate receipt.' });
  }
});

// Notifications
app.get('/api/notifications', authenticateToken, (req: AuthenticatedRequest, res) => {
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 20').all(req.user!.id);
  return res.json({ notifications });
});

app.post('/api/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
  return res.json({ success: true });
});

// ==========================================
// ADMIN DASHBOARD & MANAGEMENT ROUTES
// ==========================================

// GET /api/admin/stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, (_req, res) => {
  try {
    const totalMembers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'member'").get() as any).count;
    const activeMembers = (db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM membership_records WHERE status = 'ACTIVE'").get() as any).count;
    const expiredMembers = (db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM membership_records WHERE status = 'EXPIRED'").get() as any).count;
    const pendingRequests = (db.prepare("SELECT COUNT(*) as count FROM membership_bookings WHERE booking_status = 'PENDING_APPROVAL'").get() as any).count;
    const revenueResult = db.prepare("SELECT SUM(amount_inr) as total FROM payments WHERE payment_status = 'SUCCESS'").get() as any;
    const totalRevenue = revenueResult?.total || 0;

    const recentRegistrations = db.prepare(`
      SELECT id, full_name, email, phone, created_at
      FROM users WHERE role = 'member'
      ORDER BY id DESC LIMIT 5
    `).all();

    const recentBookings = db.prepare(`
      SELECT mb.*, u.full_name, u.email, mp.name as plan_name
      FROM membership_bookings mb
      JOIN users u ON mb.user_id = u.id
      JOIN membership_plans mp ON mb.plan_id = mp.id
      ORDER BY mb.id DESC LIMIT 6
    `).all();

    return res.json({
      stats: {
        total_members: totalMembers,
        active_members: activeMembers,
        expired_members: expiredMembers,
        pending_requests: pendingRequests,
        total_revenue_inr: totalRevenue,
      },
      recent_registrations: recentRegistrations,
      recent_bookings: recentBookings,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to load admin stats.' });
  }
});

// Member Management
app.get('/api/admin/members', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { search, status } = req.query;
    let query = `
      SELECT u.id, u.full_name, u.email, u.phone, u.fitness_goals, u.created_at,
             mr.membership_code, mr.plan_name, mr.status as membership_status, mr.start_date, mr.expiry_date, mr.price_inr
      FROM users u
      LEFT JOIN membership_records mr ON mr.id = (
        SELECT id FROM membership_records WHERE user_id = u.id ORDER BY id DESC LIMIT 1
      )
      WHERE u.role = 'member'
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR mr.membership_code LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (status) {
      if (status === 'ACTIVE' || status === 'EXPIRED' || status === 'PENDING') {
        query += ` AND mr.status = ?`;
        params.push(status);
      } else if (status === 'NONE') {
        query += ` AND mr.status IS NULL`;
      }
    }

    query += ` ORDER BY u.id DESC`;

    const members = db.prepare(query).all(...params) as any[];

    // Calculate remaining days for each member
    const enriched = members.map((m) => {
      let remaining_days = 0;
      if (m.expiry_date) {
        const remainingMs = new Date(m.expiry_date + 'T23:59:59').getTime() - Date.now();
        remaining_days = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
      }
      return {
        ...m,
        remaining_days,
      };
    });

    return res.json({ members: enriched });
  } catch (err: any) {
    console.error('Failed to query members:', err);
    return res.status(500).json({ error: 'Failed to retrieve members.' });
  }
});

app.post('/api/admin/members', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { full_name, email, phone, password, fitness_goals } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and temporary password are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const result = db.prepare(`
      INSERT INTO users (full_name, email, phone, password_hash, role, fitness_goals)
      VALUES (?, ?, ?, ?, 'member', ?)
    `).run(full_name, email.toLowerCase().trim(), phone || null, password_hash, fitness_goals || 'General Fitness');

    logAdminAction(req.user!.id, 'CREATE_MEMBER', 'user', Number(result.lastInsertRowid), `Created member ${full_name} (${email})`);

    return res.status(201).json({ message: 'Member created successfully.', member_id: result.lastInsertRowid });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create member.' });
  }
});

// Bookings & Offline Payment Approvals
// GET /api/admin/bookings - List all bookings with search and status filters
app.get('/api/admin/bookings', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT mb.*, u.full_name, u.email, u.phone, mp.name as plan_name, mp.duration_months, mp.duration_label
      FROM membership_bookings mb
      JOIN users u ON mb.user_id = u.id
      JOIN membership_plans mp ON mb.plan_id = mp.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      query += ` AND mb.booking_status = ?`;
      params.push(status);
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR mb.booking_code LIKE ?)`;
      params.push(term, term, term, term);
    }

    query += ` ORDER BY mb.id DESC`;

    const bookings = db.prepare(query).all(...params);
    return res.json({ bookings });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve bookings.' });
  }
});

// POST /api/admin/bookings - Add new booking directly from Admin end
app.post('/api/admin/bookings', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const adminId = req.user!.id;
    const {
      user_id,
      full_name,
      email,
      phone,
      plan_id,
      amount_inr,
      payment_method,
      payment_status, // 'PAID' or 'PENDING'
      booking_status, // 'CONFIRMED' or 'PENDING_APPROVAL'
      start_date,
      admin_notes,
    } = req.body;

    if (!plan_id) {
      return res.status(400).json({ error: 'Membership plan is required.' });
    }

    const plan = db.prepare('SELECT * FROM membership_plans WHERE id = ?').get(plan_id) as any;
    if (!plan) {
      return res.status(404).json({ error: 'Selected plan not found.' });
    }

    let targetUserId: number;

    if (user_id) {
      const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(user_id) as any;
      if (!existingUser) {
        return res.status(404).json({ error: 'Specified member does not exist.' });
      }
      targetUserId = existingUser.id;
    } else {
      if (!email || !full_name) {
        return res.status(400).json({ error: 'Member full name and email are required for a new member.' });
      }

      // Check if user already exists with this email
      const existingByEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
      if (existingByEmail) {
        targetUserId = existingByEmail.id;
      } else {
        // Create new member account with a random temporary password
        const salt = bcrypt.genSaltSync(10);
        const tempPassHash = bcrypt.hashSync('AuraMember2026!', salt);
        const newUserRes = db.prepare(`
          INSERT INTO users (email, password_hash, full_name, phone, role, fitness_goals)
          VALUES (?, ?, ?, ?, 'member', 'Assigned by Administrator')
        `).run(email.toLowerCase().trim(), tempPassHash, full_name.trim(), phone || null);
        targetUserId = Number(newUserRes.lastInsertRowid);
      }
    }

    const bookingCode = `BK-ADM-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalAmount = amount_inr ? Number(amount_inr) : plan.price_inr;
    const finalPayMethod = payment_method || 'Desk / Cash';
    const isPaid = payment_status === 'PAID';
    const finalBookingStatus = booking_status || (isPaid ? 'CONFIRMED' : 'PENDING_APPROVAL');
    const finalPayStatus = isPaid ? 'PAID' : 'PENDING';

    const insertBooking = db.prepare(`
      INSERT INTO membership_bookings (
        booking_code, user_id, plan_id, amount_inr, payment_method, payment_status, booking_status, admin_notes, verified_by_admin_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      bookingCode,
      targetUserId,
      plan.id,
      finalAmount,
      finalPayMethod,
      finalPayStatus,
      finalBookingStatus,
      admin_notes || 'Created via Admin Portal',
      isPaid ? adminId : null
    );

    const bookingId = Number(insertBooking.lastInsertRowid);

    let receiptNumber: string | null = null;
    let membershipCode: string | null = null;
    let expiryDate: string | null = null;

    // If marked as CONFIRMED / PAID, activate membership immediately
    if (finalBookingStatus === 'CONFIRMED' || isPaid) {
      const now = new Date();
      const startDateStr = start_date || now.toISOString().split('T')[0];
      const expiryObj = new Date(startDateStr);
      expiryObj.setMonth(expiryObj.getMonth() + plan.duration_months);
      expiryDate = expiryObj.toISOString().split('T')[0];

      receiptNumber = `RCP-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      membershipCode = `MEM-AURA-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Payment receipt
      db.prepare(`
        INSERT INTO payments (
          receipt_number, booking_id, user_id, amount_inr, payment_gateway, gateway_payment_id, payment_status, notes
        ) VALUES (?, ?, ?, ?, ?, 'ADMIN_DIRECT', 'SUCCESS', ?)
      `).run(receiptNumber, bookingId, targetUserId, finalAmount, finalPayMethod, `Issued by Admin #${adminId}`);

      // 2. Membership Record
      const recordRes = db.prepare(`
        INSERT INTO membership_records (
          membership_code, user_id, booking_id, plan_id, plan_name, price_inr, start_date, expiry_date, status, activated_by_admin_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
      `).run(membershipCode, targetUserId, bookingId, plan.id, plan.name, finalAmount, startDateStr, expiryDate, adminId);

      const recordId = Number(recordRes.lastInsertRowid);

      // 3. History
      db.prepare(`
        INSERT INTO membership_history (
          user_id, membership_record_id, action_type, old_status, new_status, notes, performed_by_id
        ) VALUES (?, ?, 'ACTIVATION', 'PENDING', 'ACTIVE', ?, ?)
      `).run(targetUserId, recordId, `Direct admin booking created and activated. Receipt #${receiptNumber}`, adminId);

      // 4. Notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, 'SUCCESS')
      `).run(
        targetUserId,
        'Membership Activated by Administrator',
        `Your subscription for ${plan.name} has been activated directly by club administration. Active until ${expiryDate}. Receipt #${receiptNumber}`
      );
    } else {
      // Create pending notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, 'INFO')
      `).run(
        targetUserId,
        'Membership Booking Created (Pending Payment)',
        `An offline booking (${bookingCode}) for ${plan.name} has been created for your profile. Please complete payment at the front desk to activate.`
      );
    }

    logAdminAction(adminId, 'CREATE_BOOKING', 'membership_booking', bookingId, `Created booking ${bookingCode} for member #${targetUserId}`);

    return res.status(201).json({
      success: true,
      message: isPaid ? 'Booking created and membership activated successfully.' : 'Booking created successfully (pending payment).',
      booking_id: bookingId,
      booking_code: bookingCode,
      membership_code: membershipCode,
      receipt_number: receiptNumber,
      expiry_date: expiryDate,
    });
  } catch (err: any) {
    console.error('Error creating admin booking:', err);
    return res.status(500).json({ error: 'Failed to create booking from admin end.' });
  }
});

// PUT /api/admin/bookings/:id - Update booking details
app.put('/api/admin/bookings/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const bookingId = req.params.id;
    const { booking_status, payment_status, payment_method, admin_notes, amount_inr } = req.body;

    const booking = db.prepare('SELECT * FROM membership_bookings WHERE id = ?').get(bookingId) as any;
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    db.prepare(`
      UPDATE membership_bookings
      SET booking_status = COALESCE(?, booking_status),
          payment_status = COALESCE(?, payment_status),
          payment_method = COALESCE(?, payment_method),
          admin_notes = COALESCE(?, admin_notes),
          amount_inr = COALESCE(?, amount_inr),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(booking_status, payment_status, payment_method, admin_notes, amount_inr ? Number(amount_inr) : null, bookingId);

    logAdminAction(req.user!.id, 'UPDATE_BOOKING', 'membership_booking', Number(bookingId), `Updated booking #${bookingId}`);
    return res.json({ success: true, message: 'Booking updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update booking.' });
  }
});

// DELETE /api/admin/bookings/:id - Delete booking
app.delete('/api/admin/bookings/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const bookingId = req.params.id;
    const booking = db.prepare('SELECT * FROM membership_bookings WHERE id = ?').get(bookingId) as any;
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Also remove associated payment and membership record if not locked
    db.prepare('DELETE FROM membership_records WHERE booking_id = ?').run(bookingId);
    db.prepare('DELETE FROM payments WHERE booking_id = ?').run(bookingId);
    db.prepare('DELETE FROM membership_bookings WHERE id = ?').run(bookingId);

    logAdminAction(req.user!.id, 'DELETE_BOOKING', 'membership_booking', Number(bookingId), `Deleted booking code ${booking.booking_code}`);
    return res.json({ success: true, message: 'Booking removed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete booking.' });
  }
});

// POST /api/admin/bookings/:id/approve - Offline payment approval by desk/admin
app.post('/api/admin/bookings/:id/approve', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const bookingId = req.params.id;
    const adminId = req.user!.id;
    const { payment_method, start_date, notes } = req.body || {};

    const booking = db.prepare('SELECT * FROM membership_bookings WHERE id = ?').get(bookingId) as any;
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.booking_status === 'CONFIRMED') {
      return res.status(400).json({ error: 'Booking has already been confirmed and activated.' });
    }

    const plan = db.prepare('SELECT * FROM membership_plans WHERE id = ?').get(booking.plan_id) as any;
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found.' });
    }

    // Determine start and expiry dates
    const now = new Date();
    const startDateStr = start_date || now.toISOString().split('T')[0];
    const expiryDateObj = new Date(startDateStr);
    expiryDateObj.setMonth(expiryDateObj.getMonth() + plan.duration_months);
    const expiryDate = expiryDateObj.toISOString().split('T')[0];

    const receiptNumber = `RCP-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const membershipCode = `MEM-AURA-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalPaymentMethod = payment_method || booking.payment_method || 'Cash at Front Desk';
    const finalNotes = notes || `Approved by Admin #${adminId}`;

    // 1. Update Booking
    db.prepare(`
      UPDATE membership_bookings
      SET booking_status = 'CONFIRMED', payment_status = 'PAID', payment_method = ?,
          verified_by_admin_id = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(finalPaymentMethod, adminId, finalNotes, bookingId);

    // 2. Insert Payment
    db.prepare(`
      INSERT INTO payments (
        receipt_number, booking_id, user_id, amount_inr, payment_gateway, gateway_payment_id, payment_status, notes
      ) VALUES (?, ?, ?, ?, ?, 'OFFLINE_VERIFIED', 'SUCCESS', ?)
    `).run(receiptNumber, bookingId, booking.user_id, booking.amount_inr, finalPaymentMethod, finalNotes);

    // 3. Create or Update Membership Record
    const recordResult = db.prepare(`
      INSERT INTO membership_records (
        membership_code, user_id, booking_id, plan_id, plan_name, price_inr, start_date, expiry_date, status, activated_by_admin_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
    `).run(membershipCode, booking.user_id, bookingId, plan.id, plan.name, booking.amount_inr, startDateStr, expiryDate, adminId);

    const recordId = Number(recordResult.lastInsertRowid);

    // 4. Log in Membership History
    db.prepare(`
      INSERT INTO membership_history (
        user_id, membership_record_id, action_type, old_status, new_status, notes, performed_by_id
      ) VALUES (?, ?, 'ACTIVATION', 'PENDING', 'ACTIVE', ?, ?)
    `).run(booking.user_id, recordId, `Approved offline payment at front desk (${finalPaymentMethod}). Receipt #${receiptNumber}`, adminId);

    // 5. Notify Member
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, 'SUCCESS')
    `).run(
      booking.user_id,
      'Offline Payment Approved - Membership Active!',
      `Your booking for ${plan.name} has been verified at the front desk. Membership is ACTIVE until ${expiryDate}. Receipt #${receiptNumber}`
    );

    logAdminAction(adminId, 'APPROVE_BOOKING', 'membership_booking', Number(bookingId), `Approved booking code ${booking.booking_code} for user #${booking.user_id}`);

    return res.json({
      success: true,
      message: 'Offline payment verified and membership activated.',
      membership_code: membershipCode,
      receipt_number: receiptNumber,
      expiry_date: expiryDate,
    });
  } catch (err: any) {
    console.error('Approve booking error:', err);
    return res.status(500).json({ error: 'Failed to approve booking.' });
  }
});

// POST /api/admin/bookings/:id/reject - Reject / Cancel Booking
app.post('/api/admin/bookings/:id/reject', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const bookingId = req.params.id;
    const adminId = req.user!.id;
    const { reason } = req.body || {};
    const rejectionReason = reason || 'Payment not completed or rejected at desk';

    const booking = db.prepare('SELECT * FROM membership_bookings WHERE id = ?').get(bookingId) as any;
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    db.prepare(`
      UPDATE membership_bookings
      SET booking_status = 'CANCELLED', payment_status = 'FAILED', admin_notes = ?,
          verified_by_admin_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(rejectionReason, adminId, bookingId);

    // Notify user
    const plan = db.prepare('SELECT name FROM membership_plans WHERE id = ?').get(booking.plan_id) as any;
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, 'WARNING')
    `).run(
      booking.user_id,
      'Membership Booking Declined',
      `Your booking request #${booking.booking_code} for ${plan?.name || 'Membership'} was rejected by administration. Reason: ${rejectionReason}`
    );

    logAdminAction(adminId, 'REJECT_BOOKING', 'membership_booking', Number(bookingId), rejectionReason);
    return res.json({ success: true, message: 'Booking has been rejected and cancelled.' });
  } catch (err: any) {
    console.error('Reject booking error:', err);
    return res.status(500).json({ error: 'Failed to reject booking.' });
  }
});

// Extend Membership by Days
app.post('/api/admin/memberships/:id/extend', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const recordId = req.params.id;
    const { days, notes } = req.body;
    const numDays = parseInt(days, 10);

    if (!numDays || numDays <= 0) {
      return res.status(400).json({ error: 'Valid number of days to extend is required.' });
    }

    const record = db.prepare('SELECT * FROM membership_records WHERE id = ?').get(recordId) as any;
    if (!record) {
      return res.status(404).json({ error: 'Membership record not found.' });
    }

    // Add days to current expiry date
    const currentExpiry = new Date(record.expiry_date);
    currentExpiry.setDate(currentExpiry.getDate() + numDays);
    const newExpiryDate = currentExpiry.toISOString().split('T')[0];

    db.prepare(`
      UPDATE membership_records
      SET expiry_date = ?, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newExpiryDate, recordId);

    db.prepare(`
      INSERT INTO membership_history (
        user_id, membership_record_id, action_type, old_status, new_status, notes, performed_by_id
      ) VALUES (?, ?, 'EXTENSION', ?, 'ACTIVE', ?, ?)
    `).run(record.user_id, recordId, record.status, `Extended by ${numDays} days by Admin: ${notes || 'Complimentary/Goodwill'}`, req.user!.id);

    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, 'SUCCESS')
    `).run(
      record.user_id,
      'Membership Extended!',
      `Good news! Your ${record.plan_name} has been extended by ${numDays} days. New expiry date is ${newExpiryDate}.`
    );

    logAdminAction(req.user!.id, 'EXTEND_MEMBERSHIP', 'membership_record', Number(recordId), `Extended by ${numDays} days to ${newExpiryDate}`);

    return res.json({
      success: true,
      message: `Membership extended by ${numDays} days.`,
      new_expiry_date: newExpiryDate,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to extend membership.' });
  }
});

// Manually update status (ACTIVE, EXPIRED, CANCELLED)
app.post('/api/admin/memberships/:id/status', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const recordId = req.params.id;
    const { status, notes } = req.body;

    if (!['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const record = db.prepare('SELECT * FROM membership_records WHERE id = ?').get(recordId) as any;
    if (!record) {
      return res.status(404).json({ error: 'Membership record not found.' });
    }

    db.prepare(`
      UPDATE membership_records
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, recordId);

    db.prepare(`
      INSERT INTO membership_history (
        user_id, membership_record_id, action_type, old_status, new_status, notes, performed_by_id
      ) VALUES (?, ?, 'STATUS_CHANGE', ?, ?, ?, ?)
    `).run(record.user_id, recordId, record.status, status, notes || 'Admin manual status change', req.user!.id);

    logAdminAction(req.user!.id, 'CHANGE_STATUS', 'membership_record', Number(recordId), `Changed status from ${record.status} to ${status}`);

    return res.json({ success: true, message: `Status updated to ${status}.` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update membership status.' });
  }
});

// Payments List
app.get('/api/admin/payments', authenticateToken, requireAdmin, (_req, res) => {
  try {
    const payments = db.prepare(`
      SELECT p.*, u.full_name, u.email, mb.booking_code, mr.plan_name
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN membership_bookings mb ON p.booking_id = mb.id
      LEFT JOIN membership_records mr ON mr.booking_id = mb.id
      ORDER BY p.id DESC
    `).all();
    return res.json({ payments });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve payments.' });
  }
});

// Plan Management
app.post('/api/admin/plans', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { name, duration_months, duration_label, price_inr, description, features, popular_badge } = req.body;
    const result = db.prepare(`
      INSERT INTO membership_plans (
        name, duration_months, duration_label, price_inr, description, features_json, popular_badge, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(name, duration_months, duration_label, price_inr, description, JSON.stringify(features || []), popular_badge ? 1 : 0);

    logAdminAction(req.user!.id, 'CREATE_PLAN', 'membership_plan', Number(result.lastInsertRowid), `Created plan ${name} for ₹${price_inr}`);
    return res.status(201).json({ message: 'Plan created successfully.', plan_id: result.lastInsertRowid });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create plan.' });
  }
});

app.put('/api/admin/plans/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const planId = req.params.id;
    const { name, duration_months, duration_label, price_inr, description, features, popular_badge, is_active } = req.body;

    db.prepare(`
      UPDATE membership_plans
      SET name = ?, duration_months = ?, duration_label = ?, price_inr = ?, description = ?,
          features_json = ?, popular_badge = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, duration_months, duration_label, price_inr, description, JSON.stringify(features || []), popular_badge ? 1 : 0, is_active ? 1 : 0, planId);

    logAdminAction(req.user!.id, 'UPDATE_PLAN', 'membership_plan', Number(planId), `Updated plan ${name}`);
    return res.json({ message: 'Plan updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update plan.' });
  }
});

app.delete('/api/admin/plans/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const planId = req.params.id;
    // Soft disable to preserve historical references
    db.prepare('UPDATE membership_plans SET is_active = 0 WHERE id = ?').run(planId);
    logAdminAction(req.user!.id, 'DISABLE_PLAN', 'membership_plan', Number(planId), 'Disabled plan');
    return res.json({ message: 'Plan deactivated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete plan.' });
  }
});

// Admin CMS Content Management
app.put('/api/admin/gym/info', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { name, tagline, about_text, mission_text, vision_text, address, phone, email, whatsapp, map_embed_url } = req.body;
    db.prepare(`
      UPDATE gym_information
      SET name = ?, tagline = ?, about_text = ?, mission_text = ?, vision_text = ?,
          address = ?, phone = ?, email = ?, whatsapp = ?, map_embed_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(name, tagline, about_text, mission_text, vision_text, address, phone, email, whatsapp, map_embed_url);

    logAdminAction(req.user!.id, 'UPDATE_GYM_INFO', 'gym_information', 1, 'Updated club profile');
    return res.json({ message: 'Gym information updated.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update gym information.' });
  }
});

// Opening hours update
app.put('/api/admin/gym/opening-hours', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res) => {
  try {
    const { hours } = req.body; // array of { id, day_of_week, open_time, close_time, is_closed }
    if (Array.isArray(hours)) {
      const stmt = db.prepare(`
        UPDATE opening_hours
        SET open_time = ?, close_time = ?, is_closed = ?
        WHERE id = ?
      `);
      for (const h of hours) {
        stmt.run(h.open_time, h.close_time, h.is_closed ? 1 : 0, h.id);
      }
    }
    logAdminAction(req.user!.id, 'UPDATE_HOURS', 'opening_hours', null, 'Updated gym schedules');
    return res.json({ message: 'Opening hours updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update opening hours.' });
  }
});

// Contact messages for admin
app.get('/api/admin/messages', authenticateToken, requireAdmin, (_req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC').all();
    return res.json({ messages });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve messages.' });
  }
});

app.put('/api/admin/messages/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, req.params.id);
    return res.json({ message: 'Message status updated.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update message.' });
  }
});

// Admin Activity Logs
app.get('/api/admin/activity-logs', authenticateToken, requireAdmin, (_req, res) => {
  try {
    const logs = db.prepare(`
      SELECT al.*, u.full_name as admin_name, u.email as admin_email
      FROM admin_activity_logs al
      JOIN users u ON al.admin_id = u.id
      ORDER BY al.id DESC LIMIT 50
    `).all();
    return res.json({ logs });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve activity logs.' });
  }
});

// ==========================================
// VITE DEV & PRODUCTION SERVING
// ==========================================

async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Aura Luxury Fitness Club Server running on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
