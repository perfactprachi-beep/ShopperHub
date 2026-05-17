import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  hasActiveOrdersForAddress,
  setDefaultAddress,
  findUserById,
  updateUserProfile,
  getPointsHistory,
} from '../db/queries/users.js';

export async function getProfile(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function editProfile(req, res, next) {
  try {
    const { full_name, phone } = req.body;
    const user = await updateUserProfile(req.user.id, { full_name, phone });
    res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (err) { next(err); }
}

export async function getFirstCitizen(req, res, next) {
  try {
    const user = await findUserById(req.user.id);
    const history = await getPointsHistory(req.user.id);
    res.json({ success: true, data: { points: user.first_citizen_points, history } });
  } catch (err) { next(err); }
}

export async function listAddresses(req, res, next) {
  try {
    const addresses = await getAddresses(req.user.id);
    res.json({ success: true, data: addresses });
  } catch (err) { next(err); }
}

export async function createAddress(req, res, next) {
  try {
    const { label, full_name, phone, line1, line2, city, state, pincode } = req.body;
    if (!line1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'line1, city, state, pincode are required' });
    }
    const address = await addAddress(req.user.id, { label, full_name, phone, line1, line2, city, state, pincode });
    res.status(201).json({ success: true, data: address, message: 'Address added' });
  } catch (err) { next(err); }
}

export async function editAddress(req, res, next) {
  try {
    const { label, full_name, phone, line1, line2, city, state, pincode } = req.body;
    const updated = await updateAddress(req.params.id, req.user.id, { label, full_name, phone, line1, line2, city, state, pincode });
    if (!updated) return res.status(404).json({ success: false, message: 'Address not found' });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

export async function removeAddress(req, res, next) {
  try {
    const hasActive = await hasActiveOrdersForAddress(req.params.id, req.user.id);
    if (hasActive) {
      return res.status(409).json({
        success: false,
        message: 'This address has an active order. You can delete it once the order is delivered or cancelled.',
      });
    }
    await deleteAddress(req.params.id, req.user.id);
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) { next(err); }
}

export async function makeDefault(req, res, next) {
  try {
    const updated = await setDefaultAddress(req.params.id, req.user.id);
    if (!updated) return res.status(404).json({ success: false, message: 'Address not found' });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}
