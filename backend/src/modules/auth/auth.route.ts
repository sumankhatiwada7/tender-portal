import express from 'express';
const router = express.Router();
import { Register, Login } from './auth.controller';

router.post('/register',Register);
router.post('/login',Login);

export default router ;