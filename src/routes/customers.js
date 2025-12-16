import { Router } from 'express';
import { addDoc, getCollection } from '../services/firestore.js';

const router = Router();
const COLLECTION = 'customers';

router.get('/', async (req, res, next) => {
  try {
    const customers = await getCollection(COLLECTION);
    res.json({ data: customers });
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

export default router;
