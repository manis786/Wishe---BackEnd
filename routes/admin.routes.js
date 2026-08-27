import express from 'express';
import { adminLogin, registerAdmin } from '../controller/admin.controller.js';

const router = express.Router();

router.post('/login', adminLogin);
router.post('/register', registerAdmin); // Initial setup ke liye

export default router;