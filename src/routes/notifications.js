import { Router } from 'express';
import { addDoc, getCollection, setDoc } from '../services/firestore.js';

const router = Router();
const COLLECTION = 'notifications';

router.get('/', async (req, res, next) => {
  try {
    const notifications = await getCollection(COLLECTION);
    const sorted = notifications
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      })
      .slice(0, 50);
    
    res.json({ data: sorted });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      createdAt: new Date().toISOString(),
      read: false
    };
    const created = await addDoc(COLLECTION, payload);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const updated = await setDoc(COLLECTION, req.params.id, { read: true });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.put('/mark-all-read', async (req, res, next) => {
  try {
    const notifications = await getCollection(COLLECTION);
    const updates = notifications
      .filter(n => !n.read)
      .map(n => setDoc(COLLECTION, n.id, { read: true }));
    
    await Promise.all(updates);
    res.json({ data: { success: true, updated: updates.length } });
  } catch (err) {
    next(err);
  }
});

export default router;
