import { Router } from 'express';
import { addDoc, deleteDocById, getCollection, getDocById, setDoc, FieldValue } from '../services/firestore.js';

const router = Router();
const COLLECTION = 'tour_packages';

router.get('/', async (req, res, next) => {
  try {
    const packages = await getCollection(COLLECTION);
    res.json({ data: packages });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pkg = await getDocById(COLLECTION, req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json({ data: pkg });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      status: req.body.status || 'active'
    };
    const created = await addDoc(COLLECTION, payload);
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
    await deleteDocById(COLLECTION, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
