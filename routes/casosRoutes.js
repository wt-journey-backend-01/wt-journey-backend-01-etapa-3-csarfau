import express from 'express';
import { casosController } from '../controllers/casosController.js';

const router = express.Router();

router.get('/', casosController.index);
router.get('/search', casosController.search);
router.get('/:id', casosController.show);
router.get('/:id/agente', casosController.showResponsibleAgente);
router.post('/', casosController.create);
router.put('/:id', casosController.update);
router.patch('/:id', casosController.patch);
router.delete('/:id', casosController.remove);

export const casosRouter = router;
