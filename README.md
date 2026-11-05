# Aura Luxury Fitness Club — Website & Membership Booking System

A premium, full-stack gym website and subscription management system built with a **Luxury White + Sky Blue** color scheme, featuring live database persistence, automated membership lifecycle calculations, Razorpay payment flows, member portals, and an executive administration dashboard.

---

## 🎨 Color Palette & Design Identity

- **Pure White**: `#FFFFFF` (Backgrounds & Crisp Cards)
- **Luxury Sky Blue**: `#55B9E8` (Highlights, Primary CTAs & Accents)
- **Deep Navy Blue**: `#123B5D` (Headings, Branding & Navigation)
- **Ice Blue**: `#EAF6FC` (Pills, Secondary Cards & Backdrops)
- **Soft Silver**: `#DCE5EB` (Borders & Dividers)
- **Light Grey**: `#F5F7F9` (Dashboard Canvas & Sections)
- **Main Text**: `#183247`
- **Secondary Text**: `#718596`

---

## 🚀 Key Features

### 1. Navigation & Separated Page Architecture
- **Separated, modular pages** for all navbar components:
  - `Home` (`/src/pages/HomePage.tsx`)
  - `About Us` (`/src/pages/AboutPage.tsx`)
  - `Facilities` (`/src/pages/FacilitiesPage.tsx`)
  - `Programs` (`/src/pages/ProgramsPage.tsx`)
  - `Membership` (`/src/pages/MembershipPage.tsx`)
  - `Booking & Checkout` (`/src/pages/BookingPage.tsx`)
  - `Gallery & Lightbox` (`/src/pages/GalleryPage.tsx`)
  - `Contact & Google Maps` (`/src/pages/ContactPage.tsx`)
  - `Login / Register / Forgot Password`
  - `My Account Dashboard` (`/src/pages/MyAccountPage.tsx`)
  - `My Membership` (`/src/pages/MyMembershipPage.tsx`) — **Most Important Feature**
  - `Admin Management Dashboard` (`/src/pages/AdminDashboardPage.tsx`)
- Sticky responsive navbar with dynamic auth buttons and mobile drawer.
- Floating WhatsApp button with prefilled concierge message.

### 2. My Membership Page (Core Feature)
- **Real-Time Remaining Days Counter**: Automatically computed on every query using the current server date (`Math.max(0, Math.ceil((expiry - now) / 1 day))`).
- **Interactive Progress Bar**: Visualizes subscription completion percentage.
- **Color-Coded Status Badges**:
  - `ACTIVE` (Green)
  - `PENDING` (Orange)
  - `EXPIRED` (Red)
  - `CANCELLED` (Grey)
- **Membership History**: Audit log of all previous and active memberships.
- **Renew Membership**: One-click renewal that extends remaining days without deleting historical data.
- **Printable Tax Invoices**: Generates official formatted receipts with printable CSS.

### 3. Membership Booking & Payment System
- Select from 4 default tiers in Indian Rupees (₹):
  1. **Monthly Membership** — 1 Month (₹2,499)
  2. **Quarterly Membership** — 3 Months (₹6,499, Most Popular)
  3. **Half-Yearly Membership** — 6 Months (₹11,499)
  4. **Yearly Membership** — 12 Months (₹19,999, Best Value)
- Two payment options:
  1. **Online Payment (Razorpay)**: Simulated test-mode checkout supporting UPI, Cards, and NetBanking with instant verification and automatic activation.
  2. **Offline Payment (Pay at Gym)**: Creates a pending request in the database awaiting front desk approval.
- Memberships activate strictly upon payment verification or admin approval.

### 4. Administrator Control Center
- **Overview Metrics**: Total Members, Active Members, Expired Members, Pending Requests, Total Revenue.
- **Member Directory**: Search by name, email, phone, or membership code; filter by status.
- **Approval Workflow**: Verify and approve offline desk payments with one click.
- **Membership Extension**: Add custom days (e.g., +30 days) with reason logs.
- **Plan Configurator**: Create, edit, and deactivate membership tiers.
- **Contact Inquiries**: Review and respond to member messages.
- **Audit Logs**: System-wide logs recording administrator actions.

---

## 🔐 Demo Credentials

### Head Administrator Account
- **Email**: `admin@auragym.com`
- **Password**: `AdminPassword123!`
- **Role**: `admin`
- *(One-click "Demo Admin" button available on Login page)*

### Demo Member Account
- **Email**: `rahul.sharma@example.com`
- **Password**: `MemberPassword123!`
- **Role**: `member`
- **Has Active Membership**: 3-Month Quarterly Plan with 75 remaining days, payment record, and official invoice `RCP-2026-0042`.
- *(One-click "Demo Member" button available on Login page)*

---

## 🛠️ Tech Stack & Database Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite (`gym.db`) with WAL mode, relational integrity, and foreign keys.
- **Security**: `bcryptjs` password hashing, `jsonwebtoken` (JWT) authentication, sanitized SQL prepared statements.

### Database Tables (17 entities):
1. `users`
2. `membership_plans`
3. `membership_bookings`
4. `membership_records`
5. `membership_history`
6. `payments`
7. `gym_information`
8. `opening_hours`
9. `facilities`
10. `trainers`
11. `programs`
12. `gallery`
13. `testimonials`
14. `contact_messages`
15. `notifications`
16. `admin_activity_logs`

---

## 💻 Development Commands

```bash
# Install dependencies
npm install

# Start full-stack development server on port 3000
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🧪 Testing the Complete User Journey

1. Open the homepage, navigate through **About Us**, **Facilities**, and **Programs**.
2. Visit **Membership** and click **Join Now** on the **Quarterly Membership**.
3. Sign in using the **Demo Member** button (`rahul.sharma@example.com` / `MemberPassword123!`).
4. You will be routed directly to **My Membership**, showing:
   - Status: `ACTIVE` (Green)
   - Remaining Days: `75 Days Remaining`
   - Progress bar percentage.
   - Click **View / Print Receipt** to open the tax invoice modal and test printing.
5. Click **Renew Membership**, select a different plan (e.g. 12 Months Yearly), and click **Pay with Razorpay**. Complete the simulated payment and observe the celebration confetti and extended active dates!
6. Log out, then log in using **Demo Admin** (`admin@auragym.com` / `AdminPassword123!`).
7. In the **Admin Panel**, observe live stats, member directories, offline approvals, and plan management.
