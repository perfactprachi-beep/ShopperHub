import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from '../services/auth.service.js';
import { findUserByEmail, findUserById, createUser } from '../db/queries/users.js';

function safeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

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
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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
