import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import { register, login, refresh, logout, checkMobile, verifyOtp, registerMobile } from '../controllers/auth.controller.js';

const router = Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().max(100).optional(),
  phone: Joi.string().max(15).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email(),
  phone: Joi.string().max(15),
  password: Joi.string().required(),
}).or('email', 'phone');

const checkMobileSchema = Joi.object({
  phone: Joi.string().min(10).max(15).required(),
});

const verifyOtpSchema = Joi.object({
  phone: Joi.string().min(10).max(15).required(),
  otp: Joi.string().length(6).required(),
});

const registerMobileSchema = Joi.object({
  phone: Joi.string().min(10).max(15).required(),
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(100).allow('').optional(),
  email: Joi.string().email().required(),
  gender: Joi.string().valid('Male', 'Female', 'Others').required(),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/check-mobile', validate(checkMobileSchema), checkMobile);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/register-mobile', validate(registerMobileSchema), registerMobile);

export default router;
