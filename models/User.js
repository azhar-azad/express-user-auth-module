const mongoose = require('mongoose');
const slugify = require('slugify');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add full name']
  },
  username: {
    type: String,
    trim: true
  },
  slug: String,
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // when returning a user, password filed will not be returned
  },
  role: {
    type: String,
    enum: ['user', 'owner'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', function(next) {
  this.slug = slugify(this.fullName, { lower: true });
  if (!this.username) {
    this.username = this.slug;
  }
  next();
});

// Encrypt password using bcryptjs
UserSchema.pre('save', async function (next) {
  // While hitting forgotpassword route,
  // this middleware will be run.
  // But we will not have a password while hitting forgotpassword route.
  // To get around this the following check is added.
  if (!this.isModified('password')) {
    // password field is not modified, so move along. Do not execute remaining function codes.
    next();
  }

  const salt = await bcryptjs.genSalt(10); // 10 is recommended
  this.password = await bcryptjs.hash(this.password, salt);
});

// Sign JWT and return
// Needed while registering a new user
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id }, // payload
    process.env.JWT_SECRET, // token secret
    { expiresIn: process.env.JWT_EXPIRE } // token expire in
  );
}

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', UserSchema);