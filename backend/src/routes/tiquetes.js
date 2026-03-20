import { Router } from 'express';
import { comprar, validar, listarMios, dashboard } from '../controllers/tiquetesController.js';
import { verificarToken, soloAdmin } from '../middleware/auth.js';
const router = Router();
router.post('/comprar', verificarToken, comprar);
router.post('/validar', verificarToken, soloAdmin, validar);
router.get('/mis-tiquetes', verificarToken, listarMios);
router.get('/dashboard', verificarToken, soloAdmin, dashboard);
export default router;
