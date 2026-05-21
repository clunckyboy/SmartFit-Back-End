import { Router } from 'express';
import users from '../services/users/routes/index.js';

const router = Router();

router.use('/', users);

export default router;