const express = require('express');
const { authenticate } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Document = require('../models/Document');
const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // Validate department is provided
    if (!department) {
      return res.status(400).json({ message: 'Department is required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      department
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

// POST /api/auth/guest
router.post('/guest', async (req, res, next) => {
  try {
    // 1. Generate a unique guest identifier
    const guestId = `guest_${Date.now()}`;

    // 2. Create a new user document in the database
    const guestUser = await User.create({
      name: 'Guest User',
      email: `${guestId}@temp.com`, // Use a temporary email
      isGuest: true, // This flag is crucial for identification
      createdAt: new Date(),
    });

    // 3. Generate a JWT for the guest user
    const token = guestUser.getSignedJwtToken();

    res.status(200).json({ success: true, token, user: guestUser });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/logout/cleanup
router.delete('/logout/cleanup', authenticate, async (req, res, next) => {
  try {
    // 1. Get user ID from the protected route middleware
    const userId = req.user.id;
    
    // 2. Delete all data owned by this user from all collections
    await Document.deleteMany({ owner: userId });
    // await AuditLog.deleteMany({ owner: userId });
    
    // 3. Delete the user account itself
    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: 'Guest data deleted.' });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
