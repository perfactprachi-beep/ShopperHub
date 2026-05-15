import { Router } from 'express';
import Joi from 'joi';
import { validate } from '../middleware/validate.js';
import { register, login, refresh, logout } from '../controllers/auth.controller.js';

const router = Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().max(100).optional(),
  phone: Joi.string().max(15).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
