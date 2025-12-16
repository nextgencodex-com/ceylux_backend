import { Router } from 'express';
import {
  addDoc,
  deleteDocById,
  getCollection,
  getDocById,
  setDoc,
  FieldValue
} from '../services/firestore.js';

const router = Router();
const COLLECTION = 'tour_categories';

router.get('/', async (req, res, next) => {
  try {
    const categories = await getCollection(COLLECTION);
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const created = await addDoc(COLLECTION, req.body);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      updatedAt: FieldValue.serverTimestamp()
    };
    const updated = await setDoc(COLLECTION, req.params.id, payload);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await getDocById(COLLECTION, req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await deleteDocById(COLLECTION, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
