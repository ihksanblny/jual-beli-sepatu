const User = require('../models/User');

/**
 * Get user addresses
 */
const getAddresses = async (userId) => {
  const user = await User.findById(userId).select('addresses');
  return user.addresses;
};

/**
 * Add address
 */
const addAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  
  if (addressData.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }
  
  user.addresses.push(addressData);
  await user.save();
  return user.addresses;
};

/**
 * Update address
 */
const updateAddress = async (userId, addressId, updateData) => {
  const user = await User.findById(userId);
  const address = user.addresses.id(addressId);
  if (!address) throw new Error('Address not found');

  if (updateData.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  address.set(updateData);
  await user.save();
  return user.addresses;
};

/**
 * Delete address
 */
const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
  await user.save();
  return user.addresses;
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
};
