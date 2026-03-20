import { Router } from 'express';
import { login, registrar } from '../controllers/authController.js';
const router = Router();
router.post('/login', login);
router.post('/registrar', registrar);
export default router;
