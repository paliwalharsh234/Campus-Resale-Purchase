const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Campus = require('../models/Campus');
const User = require('../models/User');
const Listing = require('../models/Listing');

dotenv.config();

const campusesData = [
  {
    campusName: 'Indian Institute of Technology Bombay',
    emailDomain: 'iitb.ac.in',
    city: 'Mumbai',
    state: 'Maharashtra',
    isActive: true,
  },
  {
    campusName: 'National Institute of Technology Karnataka',
    emailDomain: 'nitk.edu.in',
    city: 'Surathkal',
    state: 'Karnataka',
    isActive: true,
  },
  {
    campusName: 'Poornima College of Engineering',
    emailDomain: 'poornima.org',
    city: 'Jaipur',
    state: 'Rajasthan',
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/campus-resale';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('🍃 Connected to MongoDB for complete seeding...');

    // 1. Seed Campuses
    console.log('🌱 Seeding Campuses...');
    const createdCampuses = {};
    for (const c of campusesData) {
      let campus = await Campus.findOne({ emailDomain: c.emailDomain });
      if (!campus) {
        campus = await Campus.create(c);
        console.log(`  ➕ Created Campus: ${c.campusName} (@${c.emailDomain})`);
      } else {
        console.log(`  ℹ️ Found Campus: ${c.campusName}`);
      }
      createdCampuses[c.emailDomain] = campus;
    }

    const iitbCampus = createdCampuses['iitb.ac.in'];
    const nitkCampus = createdCampuses['nitk.edu.in'];

    // 2. Seed Users
    console.log('🌱 Seeding Users...');
    const usersData = [
      // Admin
      {
        name: 'Platform Admin',
        email: 'admin@campusresale.com',
        password: 'Password123!',
        campus: iitbCampus._id,
        role: 'admin',
        isEmailVerified: true,
      },
      // Student 1 (IIT Bombay)
      {
        name: 'Harsh Patel',
        email: 'harsh.p@iitb.ac.in',
        password: 'Password123!',
        campus: iitbCampus._id,
        course: 'B.Tech',
        branch: 'Computer Science',
        graduationYear: 2026,
        role: 'student',
        isEmailVerified: true,
      },
      // Student 2 (IIT Bombay)
      {
        name: 'Ananya Sharma',
        email: 'ananya.s@iitb.ac.in',
        password: 'Password123!',
        campus: iitbCampus._id,
        course: 'M.Tech',
        branch: 'Electrical Engineering',
        graduationYear: 2025,
        role: 'student',
        isEmailVerified: true,
      },
      // Student 3 (NITK Surathkal)
      {
        name: 'Rohan Rao',
        email: 'rohan.rao@nitk.edu.in',
        password: 'Password123!',
        campus: nitkCampus._id,
        course: 'B.Tech',
        branch: 'Mechanical Engineering',
        graduationYear: 2026,
        role: 'student',
        isEmailVerified: true,
      },
    ];

    const createdUsers = {};
    for (const u of usersData) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        console.log(`  ➕ Created User: ${u.name} (${u.email}) [${u.role}]`);
      } else {
        console.log(`  ℹ️ Found User: ${u.name} (${u.email})`);
      }
      createdUsers[u.email] = user;
    }

    const harsh = createdUsers['harsh.p@iitb.ac.in'];
    const ananya = createdUsers['ananya.s@iitb.ac.in'];
    const rohan = createdUsers['rohan.rao@nitk.edu.in'];

    // 3. Seed Sample Listings
    console.log('🌱 Seeding Sample Listings...');
    const listingsData = [
      // IIT Bombay Listings
      {
        title: 'Casio Scientific Calculator FX-991EX Classwiz',
        description:
          'Excellent condition scientific calculator used for first year Engineering Mathematics. Comes with original cover and battery is brand new.',
        price: 650,
        category: 'Electronics',
        condition: 'Like New',
        meetingPoint: 'Central Library Entrance',
        seller: harsh._id,
        campus: iitbCampus._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=60',
          },
        ],
        status: 'Available',
      },
      {
        title: 'First Year Engineering Books Bundle (Physics, Chem, Math)',
        description:
          'Giving away all my first year standard reference textbooks for free to any junior who needs them! No torn pages.',
        price: 0, // FREE ITEM
        category: 'Books',
        condition: 'Good',
        meetingPoint: 'Hostel 12 Canteen',
        seller: harsh._id,
        campus: iitbCampus._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=60',
          },
        ],
        status: 'Available',
      },
      {
        title: 'Hercules Roadeo 21-Speed Bicycle',
        description:
          'Dual disc brakes, front suspension, smooth gear shifting. Perfect for moving between academic blocks and hostels. Recently serviced.',
        price: 3200,
        category: 'Cycles',
        condition: 'Good',
        meetingPoint: 'SAC Main Gate',
        seller: ananya._id,
        campus: iitbCampus._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=60',
          },
        ],
        status: 'Available',
      },
      {
        title: 'Study Table Lamp with USB Charging Port',
        description:
          '3 brightness modes, adjustable neck, warm/cool white light. Perfect for late night exam prep.',
        price: 350,
        category: 'Hostel Items',
        condition: 'Like New',
        meetingPoint: 'Hostel 15 Common Room',
        seller: ananya._id,
        campus: iitbCampus._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&auto=format&fit=crop&q=60',
          },
        ],
        status: 'Available',
      },
      // NITK Surathkal Listing (Isolated to NITK campus)
      {
        title: 'Kross 26T Mountain Cycle with Helmet & Lock',
        description:
          'Sturdy campus cycle with lock and safety helmet included. Ideal for riding down to Surathkal beach or lecture halls.',
        price: 2800,
        category: 'Cycles',
        condition: 'Good',
        meetingPoint: 'NITK Main Gate / Beach Road',
        seller: rohan._id,
        campus: nitkCampus._id,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=800&auto=format&fit=crop&q=60',
          },
        ],
        status: 'Available',
      },
    ];

    for (const l of listingsData) {
      const exists = await Listing.findOne({ title: l.title, seller: l.seller });
      if (!exists) {
        await Listing.create(l);
        console.log(`  ➕ Created Listing: "${l.title}" (₹${l.price}) [Campus: ${l.campus}]`);
      } else {
        console.log(`  ℹ️ Listing already exists: "${l.title}"`);
      }
    }

    console.log('\n========================================');
    console.log('🎉 Seeding completed successfully!');
    console.log('========================================');
    console.log('🔑 Credentials for instant testing:');
    console.log('  👑 Admin:    admin@campusresale.com    | Password123!');
    console.log('  🎓 Student1: harsh.p@iitb.ac.in        | Password123! (IIT Bombay)');
    console.log('  🎓 Student2: ananya.s@iitb.ac.in       | Password123! (IIT Bombay)');
    console.log('  🎓 Student3: rohan.rao@nitk.edu.in     | Password123! (NITK Surathkal)');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seedDatabase();
