import { Router } from 'express';
import { addDoc, getCollection } from '../services/firestore.js';

const router = Router();
const COLLECTION = 'bookings';

router.get('/', async (req, res, next) => {
  try {
    const bookings = await getCollection(COLLECTION);
    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      status: req.body.status || 'pending'
    };
    const created = await addDoc(COLLECTION, payload);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

export default router;
