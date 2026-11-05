import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'gym.db');
export const db = new Database(DB_PATH);

// Enable WAL mode and foreign keys for high performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'member', -- 'member' or 'admin'
      emergency_contact TEXT,
      fitness_goals TEXT,
      avatar_url TEXT,
      reset_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Membership Plans Table
    CREATE TABLE IF NOT EXISTS membership_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      duration_months INTEGER NOT NULL,
      duration_label TEXT NOT NULL,
      price_inr INTEGER NOT NULL,
      description TEXT NOT NULL,
      features_json TEXT NOT NULL,
      popular_badge INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Membership Bookings Table
    CREATE TABLE IF NOT EXISTS membership_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_code TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      plan_id INTEGER NOT NULL REFERENCES membership_plans(id),
      amount_inr INTEGER NOT NULL,
      payment_method TEXT NOT NULL, -- 'razorpay' or 'offline'
      payment_status TEXT NOT NULL, -- 'PAID', 'PENDING', 'FAILED'
      booking_status TEXT NOT NULL, -- 'CONFIRMED', 'PENDING_APPROVAL', 'CANCELLED'
      admin_notes TEXT,
      verified_by_admin_id INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Active & Historical Membership Records
    CREATE TABLE IF NOT EXISTS membership_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      membership_code TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      booking_id INTEGER REFERENCES membership_bookings(id),
      plan_id INTEGER REFERENCES membership_plans(id),
      plan_name TEXT NOT NULL,
      price_inr INTEGER NOT NULL,
      start_date DATE NOT NULL,
      expiry_date DATE NOT NULL,
      status TEXT NOT NULL, -- 'ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED'
      notes TEXT,
      activated_by_admin_id INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Membership History / Audit Log
    CREATE TABLE IF NOT EXISTS membership_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      membership_record_id INTEGER REFERENCES membership_records(id),
      action_type TEXT NOT NULL, -- 'ACTIVATION', 'RENEWAL', 'EXTENSION', 'EXPIRATION', 'STATUS_CHANGE'
      old_status TEXT,
      new_status TEXT,
      notes TEXT,
      performed_by_id INTEGER REFERENCES users(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. Payments Table
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_number TEXT UNIQUE NOT NULL,
      booking_id INTEGER NOT NULL REFERENCES membership_bookings(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      amount_inr INTEGER NOT NULL,
      payment_gateway TEXT NOT NULL, -- 'Razorpay', 'Offline / Cash at Desk', 'Bank Transfer'
      gateway_order_id TEXT,
      gateway_payment_id TEXT,
      payment_status TEXT NOT NULL, -- 'SUCCESS', 'PENDING', 'FAILED'
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. Gym Information
    CREATE TABLE IF NOT EXISTS gym_information (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      about_text TEXT NOT NULL,
      mission_text TEXT NOT NULL,
      vision_text TEXT NOT NULL,
      experience_years INTEGER DEFAULT 12,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      map_embed_url TEXT NOT NULL,
      instagram_url TEXT,
      facebook_url TEXT,
      youtube_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. Opening Hours
    CREATE TABLE IF NOT EXISTS opening_hours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week TEXT NOT NULL,
      open_time TEXT NOT NULL,
      close_time TEXT NOT NULL,
      is_closed INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0
    );

    -- 9. Facilities
    CREATE TABLE IF NOT EXISTS facilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      features_json TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    -- 10. Programs
    CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      duration TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      schedule_info TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    -- 11. Trainers
    CREATE TABLE IF NOT EXISTS trainers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      specialization TEXT NOT NULL,
      experience TEXT NOT NULL,
      bio TEXT NOT NULL,
      image_url TEXT NOT NULL,
      instagram TEXT,
      sort_order INTEGER DEFAULT 0
    );

    -- 12. Gallery
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );

    -- 13. Testimonials
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_name TEXT NOT NULL,
      role_or_title TEXT NOT NULL,
      rating INTEGER NOT NULL,
      review_text TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_featured INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    -- 14. Contact Messages
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'UNREAD', -- 'UNREAD', 'READ', 'RESOLVED'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 15. Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'INFO', -- 'SUCCESS', 'WARNING', 'INFO'
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 16. Admin Activity Logs
    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDefaultData();
}

function seedDefaultData() {
  // Check if primary admin maow4028@gmail.com exists
  const existingMasterAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('maow4028@gmail.com') as { id: number } | undefined;
  const masterSalt = bcrypt.genSaltSync(10);
  const masterHash = bcrypt.hashSync('202020', masterSalt);

  if (!existingMasterAdmin) {
    db.prepare(`
      INSERT INTO users (email, password_hash, full_name, phone, role, fitness_goals)
      VALUES (?, ?, ?, ?, 'admin', 'Club Administrator')
    `).run('maow4028@gmail.com', masterHash, 'Master Administrator', '+91 91528 77826');
  } else {
    db.prepare(`
      UPDATE users SET role = 'admin', password_hash = ?, phone = '+91 91528 77826' WHERE email = ?
    `).run(masterHash, 'maow4028@gmail.com');
  }

  // Also support secondary demo admin
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@auragym.com') as { id: number } | undefined;
  let adminId: number;

  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('AdminPassword123!', salt);
    const res = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, phone, role, fitness_goals)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('admin@auragym.com', hash, 'Vikram Singhania (Head Director)', '+91 91528 77826', 'admin', 'Club Management');
    adminId = Number(res.lastInsertRowid);
  } else {
    adminId = existingAdmin.id;
  }

  // Check if demo member Rahul Sharma exists
  const existingMember = db.prepare('SELECT id FROM users WHERE email = ?').get('rahul.sharma@example.com') as { id: number } | undefined;
  let memberId: number;

  if (!existingMember) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('MemberPassword123!', salt);
    const res = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, phone, role, fitness_goals, emergency_contact)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'rahul.sharma@example.com',
      hash,
      'Rahul Sharma',
      '+91 98765 43210',
      'member',
      'Hypertrophy, Strength Conditioning & Endurance',
      '+91 98765 00000 (Priya Sharma - Spouse)'
    );
    memberId = Number(res.lastInsertRowid);
  } else {
    memberId = existingMember.id;
  }

  // Seed Membership Plans if empty
  const planCount = db.prepare('SELECT COUNT(*) as count FROM membership_plans').get() as { count: number };
  if (planCount.count === 0) {
    const insertPlan = db.prepare(`
      INSERT INTO membership_plans (name, duration_months, duration_label, price_inr, description, features_json, popular_badge, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    insertPlan.run(
      'Monthly Membership',
      1,
      '1 Month',
      2499,
      'Ideal for short-term fitness goals, business travelers, or those wishing to experience world-class amenities.',
      JSON.stringify([
        'Full access to luxury gym floor & cardio suite',
        'Locker room & private steam shower access',
        '1 complimentary fitness assessment session',
        'Access to Aura Mobile Member Portal',
        'Free filtered infused hydration water'
      ]),
      0,
      1
    );

    insertPlan.run(
      'Quarterly Membership',
      3,
      '3 Months',
      6499,
      'Our most popular program designed for substantial physical transformation and sustained lifestyle change.',
      JSON.stringify([
        'Unlimited access to all gym sections 7 days a week',
        '2 Personal training induction sessions',
        'Personalized nutrition & diet guidance protocol',
        'All group fitness, yoga & functional training classes',
        'Complimentary guest pass per month',
        'Steam bath & luxury recovery lounge access'
      ]),
      1,
      2
    );

    insertPlan.run(
      'Half-Yearly Membership',
      6,
      '6 Months',
      11499,
      'Serious commitment towards elite athletic endurance, aesthetic body recomposition, and strength milestones.',
      JSON.stringify([
        'Unlimited access + priority locker reservation',
        '5 Personal training master sessions',
        'Quarterly InBody 570 body composition analysis',
        'Unlimited group studios (Zumba, HIIT, Power Yoga)',
        '15% discount at Aura Protein & Smoothie Bar',
        'Pause membership option (up to 21 days)'
      ]),
      0,
      3
    );

    insertPlan.run(
      'Yearly Membership',
      12,
      '12 Months',
      19999,
      'The ultimate elite VIP fitness package with unmatched personalized care, private wellness privileges, and maximum savings.',
      JSON.stringify([
        '365 Days all-inclusive VIP Access',
        '12 One-on-one personal training sessions with Master Coach',
        'Full personalized biometric tracking & nutrition consultations',
        'Permanent dedicated executive locker with laundry concierge',
        'Free Aura Luxury Gym Kit (Bag, Shaker, Microfiber Towels)',
        'Membership pause option (up to 45 days)',
        '4 complimentary guest passes per quarter'
      ]),
      0,
      4
    );
  }

  // Seed demo active membership for Rahul Sharma if none exists
  const existingRecords = db.prepare('SELECT id FROM membership_records WHERE user_id = ?').all(memberId);
  if (existingRecords.length === 0) {
    // 3-month quarterly plan
    const quarterlyPlan = db.prepare("SELECT * FROM membership_plans WHERE duration_months = 3").get() as any;
    if (quarterlyPlan) {
      // Start date: 15 days ago, Expiry date: 75 days from now
      const now = new Date();
      const startDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const expiryDate = new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Booking
      const bookRes = db.prepare(`
        INSERT INTO membership_bookings (
          booking_code, user_id, plan_id, amount_inr, payment_method, payment_status, booking_status, admin_notes, verified_by_admin_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'BK-AURA-2026-9812',
        memberId,
        quarterlyPlan.id,
        quarterlyPlan.price_inr,
        'razorpay',
        'PAID',
        'CONFIRMED',
        'Instant Razorpay verification confirmed',
        adminId
      );
      const bookingId = Number(bookRes.lastInsertRowid);

      // Membership record
      const recordRes = db.prepare(`
        INSERT INTO membership_records (
          membership_code, user_id, booking_id, plan_id, plan_name, price_inr, start_date, expiry_date, status, activated_by_admin_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'MEM-AURA-8401',
        memberId,
        bookingId,
        quarterlyPlan.id,
        quarterlyPlan.name,
        quarterlyPlan.price_inr,
        startDate,
        expiryDate,
        'ACTIVE',
        adminId
      );
      const recordId = Number(recordRes.lastInsertRowid);

      // Payment record
      db.prepare(`
        INSERT INTO payments (
          receipt_number, booking_id, user_id, amount_inr, payment_gateway, gateway_order_id, gateway_payment_id, payment_status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'RCP-2026-0042',
        bookingId,
        memberId,
        quarterlyPlan.price_inr,
        'Razorpay (Online Payment)',
        'order_N8qLd98x21a',
        'pay_N8qM003182k',
        'SUCCESS',
        'UPI Payment: rahul.sharma@okaxis'
      );

      // History
      db.prepare(`
        INSERT INTO membership_history (
          user_id, membership_record_id, action_type, old_status, new_status, notes, performed_by_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        memberId,
        recordId,
        'ACTIVATION',
        'PENDING',
        'ACTIVE',
        'Initial online booking activation with verified Razorpay payment receipt RCP-2026-0042',
        adminId
      );

      // Notification
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
      `).run(
        memberId,
        'Welcome to Aura Luxury Fitness Club!',
        'Your Quarterly Membership (3 Months) is now ACTIVE. Your digital membership code is MEM-AURA-8401. Enjoy state-of-the-art facilities.',
        'SUCCESS'
      );
    }
  }

  // Seed Gym Information
  const gymInfo = db.prepare('SELECT id FROM gym_information LIMIT 1').get();
  if (!gymInfo) {
    db.prepare(`
      INSERT INTO gym_information (
        name, tagline, about_text, mission_text, vision_text, experience_years,
        address, phone, email, whatsapp, map_embed_url, instagram_url, facebook_url, youtube_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Aura Luxury Fitness Club',
      'Where Luxury Meets Human Potential',
      'Aura Luxury Fitness Club is India’s foremost sanctuary for high-performance fitness, physical conditioning, and mindful wellness. Designed in serene whites and calm sky-blues, our 25,000 sq.ft facility combines cutting-edge biomechanic machinery, elite certified trainers, and personalized recovery amenities.',
      'To empower our members with world-class facilities, personalized science-backed training protocols, and an inspirational environment that transforms physical health and mental resilience.',
      'To become the benchmark for international luxury fitness clubs, fostering a vibrant, supportive community driven by excellence, vitality, and longevity.',
      12,
      'Plot 42, Platinum Enclave, Linking Road, Bandra West, Mumbai, Maharashtra 400050',
      '+91 22 2640 8899 / +91 91528 77826',
      'concierge@auragym.com',
      '+919152877826',
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.8357488053676!2d72.82967667595304!3d19.060010952811444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9135084a923%3A0xc00f07c72e23bdf2!2sLinking%20Rd%2C%20Bandra%20West%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1714500000000!5m2!1sen!2sin',
      'https://instagram.com/auraluxuryfitness',
      'https://facebook.com/auraluxuryfitness',
      'https://youtube.com/@auraluxuryfitness'
    );
  }

  // Seed Opening Hours
  const hoursCount = db.prepare('SELECT COUNT(*) as count FROM opening_hours').get() as { count: number };
  if (hoursCount.count === 0) {
    const insertHour = db.prepare(`
      INSERT INTO opening_hours (day_of_week, open_time, close_time, is_closed, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertHour.run('Monday', '05:30 AM', '10:30 PM', 0, 1);
    insertHour.run('Tuesday', '05:30 AM', '10:30 PM', 0, 2);
    insertHour.run('Wednesday', '05:30 AM', '10:30 PM', 0, 3);
    insertHour.run('Thursday', '05:30 AM', '10:30 PM', 0, 4);
    insertHour.run('Friday', '05:30 AM', '10:30 PM', 0, 5);
    insertHour.run('Saturday', '06:00 AM', '10:00 PM', 0, 6);
    insertHour.run('Sunday', '07:00 AM', '08:00 PM', 0, 7);
  }

  // Seed Facilities
  const facilityCount = db.prepare('SELECT COUNT(*) as count FROM facilities').get() as { count: number };
  if (facilityCount.count === 0) {
    const insertFacility = db.prepare(`
      INSERT INTO facilities (title, category, description, image_url, features_json, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertFacility.run(
      'Modern Gym Equipment',
      'Machinery',
      'Biomechanical selectorized stations and plate-loaded gear from Technogym & Hammer Strength.',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(['Pure strength equipment', 'Custom ergonomics', 'Digital repetition sensors', 'Anti-slip grips']),
      1
    );

    insertFacility.run(
      'Cardio Section',
      'Endurance',
      'Panoramic ocean-view treadmills, climbmills, upright bikes, and water rowers with interactive streaming displays.',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(['Technogym Artis Treadmills', 'Concept2 Rowers & SkiErgs', 'Integrated heart-rate sync', 'Live scenic runs']),
      2
    );

    insertFacility.run(
      'Strength Training Area',
      'Strength',
      'Heavy-duty squat racks, Olympic competition platforms, calibrated bumper plates, and dumbbell banks up to 60kg.',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(['Eleiko Olympic bars & bumpers', '6 Power racks with safety straps', 'Precision dumbbell bank (2kg - 60kg)', 'Chalk stands']),
      3
    );

    insertFacility.run(
      'Weightlifting Section',
      'Powerlifting & Cross',
      'Shock-absorbing rubberized acoustic flooring, deadlift jacks, lifting belts, and specialized barbells.',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(['Dedicated deadlift platforms', 'Trap bars & cambered squat bars', 'Acoustic drop zones', 'Competition collars']),
      4
    );

    insertFacility.run(
      'Personal Training Studios',
      'Coaching',
      'Private 1-on-1 coaching enclosures equipped with assessment stations and personalized movement screening.',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(['Private coaching pods', 'Functional movement screening', 'Heart-rate telemetry', 'Custom workout programming']),
      5
    );

    insertFacility.run(
      'Changing Rooms & Spa',
      'Wellness',
      'Italian marble steam chambers, Finnish dry sauna, rainfall showers, and salon-grade grooming amenities.',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(['Eucalyptus steam rooms', 'Scandinavian cedar sauna', 'Dyson supersonic hair stations', 'Fresh plush bath towels']),
      6
    );

    insertFacility.run(
      'Executive Locker Facilities',
      'Convenience',
      'RFID digital keypad lockers, secure valuables deposit boxes, laundry valet services, and shoe polishing.',
      'https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(['Keyless RFID wristband access', 'Mobile USB charging inside lockers', 'Shoe shine & suit steaming', 'Overnight bag drop']),
      7
    );

    insertFacility.run(
      'Group Training Studio',
      'Studio',
      'Spacious sprung hardwood studio floor, acoustic surround sound, and atmospheric ambient mood lighting.',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
      JSON.stringify(['Sprung oak shock flooring', 'Concert Bose sound system', 'TRX suspension bays', 'Zumba & Yoga props']),
      8
    );
  }

  // Seed Programs
  const programCount = db.prepare('SELECT COUNT(*) as count FROM programs').get() as { count: number };
  if (programCount.count === 0) {
    const insertProg = db.prepare(`
      INSERT INTO programs (title, category, duration, difficulty, description, image_url, schedule_info, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProg.run(
      'Strength & Hypertrophy',
      'Strength Training',
      '60 Mins',
      'Intermediate to Advanced',
      'Focused compound lifts, progressive overload tracking, and muscle volume stimulus for maximum power and density.',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1000&q=80',
      'Mon, Wed, Fri - 07:00 AM & 06:30 PM',
      1
    );

    insertProg.run(
      'Functional Athlete HIIT',
      'Cardio & Agility',
      '45 Mins',
      'All Levels',
      'High-intensity interval training combining kettlebells, plyometrics, assault bikes, and sled pushes for rapid calorie burn.',
      'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=1000&q=80',
      'Tue, Thu, Sat - 08:00 AM & 07:00 PM',
      2
    );

    insertProg.run(
      'Power Vinyasa Yoga',
      'Mind & Flexibility',
      '60 Mins',
      'Beginner to Intermediate',
      'Dynamic breath-synchronized movements designed to develop deep core stability, joint mobility, and mental serenity.',
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80',
      'Daily Morning - 06:30 AM & 08:30 AM',
      3
    );

    insertProg.run(
      'Body Transformation Bootcamp',
      'Weight Management',
      '50 Mins',
      'All Levels',
      'Comprehensive body recomposition combining metabolic circuits, nutritional macros guidance, and biometric progress audits.',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80',
      'Mon to Sat - 07:30 AM & 06:00 PM',
      4
    );

    insertProg.run(
      'Zumba & Aerobic Fusion',
      'Group Fitness',
      '55 Mins',
      'Beginner Friendly',
      'High-energy Latin rhythms, upbeat choreography, and continuous movement that feels like a party while shedding calories.',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
      'Mon, Wed, Fri - 05:30 PM',
      5
    );

    insertProg.run(
      'VIP 1-on-1 Personal Training',
      'Personal Training',
      '60 Mins',
      'Customized',
      'Direct one-on-one session with our senior sports science specialists, including form diagnostics, periodized programming, and recovery.',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1000&q=80',
      'Flexible booking by appointment',
      6
    );
  }

  // Seed Trainers
  const trainerCount = db.prepare('SELECT COUNT(*) as count FROM trainers').get() as { count: number };
  if (trainerCount.count === 0) {
    const insertTrainer = db.prepare(`
      INSERT INTO trainers (name, role, specialization, experience, bio, image_url, instagram, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTrainer.run(
      'Devendra Rathore',
      'Head Strength & Conditioning Coach',
      'Olympic Weightlifting, Hypertrophy, Biomechanics',
      '14+ Years Experience',
      'Former national powerlifting champion and CSCS-certified trainer with over a decade coaching elite corporate executives and competitive athletes.',
      'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=800&q=80',
      '@devendra_fit',
      1
    );

    insertTrainer.run(
      'Ananya Sen',
      'Senior Functional Trainer & Pilates Master',
      'Core Architecture, Posture Correction, HIIT',
      '9+ Years Experience',
      'Certified in Stott Pilates and functional kinetics, Ananya specializes in sculpted core training, mobility restoration, and high-performance endurance.',
      'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=80',
      '@ananya_movement',
      2
    );

    insertTrainer.run(
      'Marcus Fernandes',
      'Lead Metabolic & Physique Coach',
      'Body Recomposition, Clinical Nutrition, Cardio Protocols',
      '11+ Years Experience',
      'Precision nutrition specialist who has guided over 500 members through sustainable, life-altering 90-day physique transformations.',
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      '@coach_marcusf',
      3
    );

    insertTrainer.run(
      'Tara Nair',
      'Mind-Body & Yoga Directress',
      'Ashtanga Vinyasa, Breathwork, Joint Longevity',
      '8+ Years Experience',
      'Trained in Rishikesh and certified 500-RYT, Tara guides members toward nervous system regulation, flexibility, and meditative flow.',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      '@tara_flowstate',
      4
    );
  }

  // Seed Gallery
  const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery').get() as { count: number };
  if (galleryCount.count === 0) {
    const insertGallery = db.prepare(`
      INSERT INTO gallery (title, category, image_url, description, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertGallery.run(
      'Main Strength Arena',
      'Interior',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
      'Spacious pure white and sky-blue accented lifting arena with custom Italian lighting.',
      1
    );

    insertGallery.run(
      'Panoramic Cardio Suite',
      'Cardio',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=80',
      'Floor-to-ceiling illuminated cardio stations with continuous fresh air circulation.',
      2
    );

    insertGallery.run(
      'Olympic Competition Platforms',
      'Equipment',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
      'Eleiko certified precision barbells, calibrated bumper plates, and chalk bowls.',
      3
    );

    insertGallery.run(
      'Dumbbell Vault & Free Weights',
      'Equipment',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80',
      'Polyurethane dumbbell pairs ranging from 2kg up to 60kg with custom knurling.',
      4
    );

    insertGallery.run(
      'Functional Agility Turf',
      'Training',
      'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=1200&q=80',
      '30-meter indoor synthetic sprint and power-sled sprint track with distance markings.',
      5
    );

    insertGallery.run(
      'Personal Coaching in Action',
      'Trainers',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80',
      'One-on-one tailored guidance ensuring optimal technique and injury prevention.',
      6
    );

    insertGallery.run(
      'Yoga & Mindful Movement Studio',
      'Group Activities',
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
      'Acoustically insulated zen sanctuary with organic bamboo flooring.',
      7
    );

    insertGallery.run(
      'Luxury Spa & Recovery Lounge',
      'Interior',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      'Post-workout hydrotherapy rainfall showers and eucalyptus aromatic steam.',
      8
    );
  }

  // Seed Testimonials
  const testCount = db.prepare('SELECT COUNT(*) as count FROM testimonials').get() as { count: number };
  if (testCount.count === 0) {
    const insertTestimonial = db.prepare(`
      INSERT INTO testimonials (member_name, role_or_title, rating, review_text, image_url, is_featured, sort_order)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `);

    insertTestimonial.run(
      'Karan Mehta',
      'Managing Director & Marathoner',
      5,
      'Aura represents the gold standard of international fitness clubs. The pristine white-and-blue aesthetic, hygienic facilities, and knowledgeable trainers create an atmosphere where pushing your limits is natural.',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      1
    );

    insertTestimonial.run(
      'Sneha Kulkarni',
      'Tech Entrepreneur',
      5,
      'The booking and membership management portal is seamless. I booked my 6-month plan online, received my instant digital receipt, and the staff knew my name from day one. Truly a 5-star experience.',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      2
    );

    insertTestimonial.run(
      'Dr. Sameer Chawla',
      'Orthopedic Surgeon',
      5,
      'As a physician, I am extremely particular about biomechanics and safety. Aura has the finest ergonomic machinery from Technogym. Their trainers respect anatomical form above all else.',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      3
    );
  }
}

// Automatic Membership Management Engine
export function evaluateAndRefreshMembershipStatuses() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Find all ACTIVE memberships where expiry_date < todayStr
  const expiredRecords = db.prepare(`
    SELECT mr.*, u.full_name, u.email
    FROM membership_records mr
    JOIN users u ON mr.user_id = u.id
    WHERE mr.status = 'ACTIVE' AND mr.expiry_date < ?
  `).all(todayStr) as any[];

  if (expiredRecords.length > 0) {
    const updateStmt = db.prepare(`
      UPDATE membership_records
      SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const logStmt = db.prepare(`
      INSERT INTO membership_history (
        user_id, membership_record_id, action_type, old_status, new_status, notes
      ) VALUES (?, ?, 'EXPIRATION', 'ACTIVE', 'EXPIRED', ?)
    `);

    const notifStmt = db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, 'WARNING')
    `);

    for (const record of expiredRecords) {
      updateStmt.run(record.id);
      logStmt.run(record.user_id, record.id, `Membership automatically marked as EXPIRED as of ${todayStr}`);
      notifStmt.run(
        record.user_id,
        'Membership Expired',
        `Your ${record.plan_name} has expired on ${record.expiry_date}. Click "Renew Membership" on your dashboard to continue uninterrupted.`
      );
    }
  }
}
