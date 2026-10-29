import { Router } from 'express';
import { dispatchController } from './dispatch.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/map-data', dispatchController.getMapData);
router.post('/telemetry', dispatchController.recordTelemetry);
router.post('/route', dispatchController.createRoute);

export default router;
