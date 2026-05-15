import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../db/queries/users.js';

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
