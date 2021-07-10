const mongoose = require('mongoose');
const slugify = require('slugify');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add full name']
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
    enum: ['user'],
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

// Cascade delete todos when an user is deleted
UserSchema.pre('remove', async function (next) {
  console.log(`Todos being removed for user ${this._id}`);
  await this.model('Todo').deleteMany({ user: this._id });
  next();
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

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Set the hashed version of resetToken
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Return the original resetToken, not the hashed version
  return resetToken;
}

module.exports = mongoose.model('User', UserSchema);