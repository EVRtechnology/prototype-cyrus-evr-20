/**
 * Routes Index
 */

import { Router } from 'express';
import sessionRoutes from './sessions';
import participantRoutes from './participants';
import healthRoutes from './health';

const router = Router();

// Mount routes
router.use('/sessions', sessionRoutes);
router.use('/participants', participantRoutes);
router.use('/health', healthRoutes);

export default router;
