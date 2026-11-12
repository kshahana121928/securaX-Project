import { Router } from 'express';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  testContactAlert,
} from '../controllers/contactController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getContacts);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.post('/:id/test', testContactAlert);

export default router;
