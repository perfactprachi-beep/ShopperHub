import { randomBytes } from 'crypto';
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from '../services/auth.service.js';
import { sendOtp } from '../services/sms.service.js';
import { findUserByEmail, findUserByPhone, findUserById, createUser } from '../db/queries/users.js';

function safeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

// ── In-memory stores ──────────────────────────────────────────────────────────
// OTP store: phone → { otp, expiresAt }
const otpStore = new Map();
// Verified phones (OTP confirmed, awaiting registration): phone → expiresAt
const verifiedPhones = new Map();

export async function register(req, res, next) {
  try {
    const { email, password, fullName, phone } = req.body;

    if (await findUserByEmail(email)) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ email, passwordHash, fullName, phone });

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ success: true, accessToken, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, phone, password } = req.body;

    const user = phone
      ? await findUserByPhone(phone)
      : await findUserByEmail(email);

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });
    setRefreshCookie(res, refreshToken);

    res.json({ success: true, accessToken, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const payload = verifyRefreshToken(token);
    const user = await findUserById(payload.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const newRefresh = signRefreshToken({ id: user.id });
    setRefreshCookie(res, newRefresh);

    res.json({ success: true, accessToken, user });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
}

export async function logout(_req, res) {
  clearRefreshCookie(res);
  res.json({ success: true, message: 'Logged out' });
}

// ── Mobile-OTP flow ───────────────────────────────────────────────────────────

/**
 * Step 1 — Always generate & send OTP for the given mobile number.
 */
export async function checkMobile(req, res, next) {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 min

    await sendOtp(phone, otp);

    const isDev = process.env.NODE_ENV !== 'production';
    res.json({ success: true, message: 'OTP sent', ...(isDev && { devOtp: otp }) });
  } catch (err) {
    next(err);
  }
}

/**
 * Step 2 — Verify OTP.
 * - Existing user → returns tokens + user (login complete).
 * - New user → marks phone as verified, returns { exists: false }.
 */
export async function verifyOtp(req, res, next) {
  try {
    const { phone, otp } = req.body;
    const record = otpStore.get(phone);

    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    if (record.otp !== String(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    otpStore.delete(phone);

    const user = await findUserByPhone(phone);
    if (user) {
      // Existing user — log in directly
      const accessToken = signAccessToken({ id: user.id, role: user.role });
      const refreshToken = signRefreshToken({ id: user.id });
      setRefreshCookie(res, refreshToken);
      return res.json({ success: true, exists: true, accessToken, user: safeUser(user) });
    }

    // New user — mark phone as verified for 15 minutes
    verifiedPhones.set(phone, Date.now() + 15 * 60 * 1000);
    return res.json({ success: true, exists: false });
  } catch (err) {
    next(err);
  }
}

/**
 * Step 3 (new users only) — Complete registration after phone is OTP-verified.
 */
export async function registerMobile(req, res, next) {
  try {
    const { phone, firstName, lastName, email, gender } = req.body;

    const verifiedUntil = verifiedPhones.get(phone);
    if (!verifiedUntil || verifiedUntil < Date.now()) {
      return res.status(403).json({ success: false, message: 'Phone not verified. Please restart the flow.' });
    }

    if (await findUserByPhone(phone)) {
      return res.status(409).json({ success: false, message: 'This mobile number is already registered' });
    }
    if (email && await findUserByEmail(email)) {
      return res.status(409).json({ success: false, message: 'This email is already registered' });
    }

    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    // Passwordless registration — unguessable random hash
    const passwordHash = await hashPassword(randomBytes(32).toString('hex'));

    const user = await createUser({ email: email || null, passwordHash, fullName, phone, gender });
    verifiedPhones.delete(phone);

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ success: true, accessToken, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
}
