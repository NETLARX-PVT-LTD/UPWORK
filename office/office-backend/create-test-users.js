const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Test users to create
    const testUsers = [
      {
        name: 'John Smith',
        email: 'john.smith@office.com',
        password: 'user123',
        role: 'user',
        department: 'Human Resources'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@office.com',
        password: 'user123',
        role: 'user',
        department: 'Finance'
      }
    ];

    console.log('Creating test users...\n');

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists - skipping`);
        continue;
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        department: userData.department
      });

      await user.save();
      console.log(`✅ Created user: ${userData.name}`);
      console.log(`   📧 Email: ${userData.email}`);
      console.log(`   🏢 Department: ${userData.department}`);
      console.log(`   🔑 Password: ${userData.password}\n`);
    }

    console.log('🎉 Test users created successfully!');
    console.log('\n📝 Summary:');
    console.log('   • All test users have password: user123');
    console.log('   • You can view them in Admin Panel > Manage Users');
    console.log('   • You can also login as these users to test user functionality');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestUsers();
