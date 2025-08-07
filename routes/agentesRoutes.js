import express from 'express';
import { agentesController } from '../controllers/agentesController.js';

const router = express.Router();

router.get('/', agentesController.index);
router.get('/:id', agentesController.show);
router.post('/', agentesController.create);
router.put('/:id', agentesController.update);
router.patch('/:id', agentesController.patch);
router.delete('/:id', agentesController.remove);

export const agentesRouter = router;
