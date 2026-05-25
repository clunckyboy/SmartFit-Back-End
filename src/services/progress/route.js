import { Router } from 'express';
import authenticateToken from '../../middlewares/authentication.js';
import { getProgressToday, updateActivityProgress, updateFoodProgress } from './progress-controller.js';

const router = Router();

router.get('/today', authenticateToken, getProgressToday);
router.post('/activity', authenticateToken, updateActivityProgress);
router.post('/food', authenticateToken, updateFoodProgress);

export default router;