const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // 1. need to import 'jsonwebtoken'
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, 
    required: function() { return !this.isGuest; } // Password is only required for non-guest users
  },
  department: { type: String, 
   required: function() { return !this.isGuest; } // Department is only required for non-guest users
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // for guest users
   isGuest: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// 2. Add the getSignedJwtToken method to the schema
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

module.exports = mongoose.model('User', userSchema);
