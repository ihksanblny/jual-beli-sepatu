const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const logger = require('../utils/logger');
const { sendVerificationEmail } = require('./email.service');

/**
 * Register a new user
 */
const registerUser = async (userData) => {
  const { email, password, firstName, lastName } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('User already exists');

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const user = await User.create({ 
    email, 
    password, 
    firstName, 
    lastName,
    verificationToken,
    verificationTokenExpires
  });

  // Send verification email
  await sendVerificationEmail(user, verificationToken);

  const token = generateToken(user._id, user.role);

  return {
    user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isEmailVerified: user.isEmailVerified },
    token
  };
};

/**
 * Verify user email
 */
const verifyEmail = async (token) => {
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error('Verification token is invalid or has expired');
  }

  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return user;
};

/**
 * Authenticate user
 */
const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error('Invalid credentials');

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new Error('Please verify your email address before logging in');
  }

  const token = generateToken(user._id, user.role);

  return {
    user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isEmailVerified: user.isEmailVerified },
    token
  };
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updateData) => {
  const { firstName, lastName, email } = updateData;
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) throw new Error('Email is already in use');
  }
  return await User.findByIdAndUpdate(userId, { firstName, lastName, email }, { new: true, runValidators: true });
};

/**
 * Resend verification email
 */
const resendVerification = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  if (user.isEmailVerified) throw new Error('Email is already verified');

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

  user.verificationToken = verificationToken;
  user.verificationTokenExpires = verificationTokenExpires;
  await user.save();

  // Send verification email
  await sendVerificationEmail(user, verificationToken);

  return { message: 'Verification email resent successfully' };
};

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  verifyEmail,
  resendVerification
};