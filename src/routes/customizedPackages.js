import { Router } from 'express';
import { addDoc, getCollection, getDocById, setDoc, FieldValue } from '../services/firestore.js';
import { createNotification, notificationTypes } from '../services/notifications.js';

const router = Router();
const COLLECTION = 'customized_packages';

router.get('/', async (req, res, next) => {
  try {
    const items = await getCollection(COLLECTION);
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await getDocById(COLLECTION, req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Customized package not found' });
    }
    res.json({ data: doc });
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
    
    await createNotification(
      notificationTypes.NEW_INQUIRY,
      `New customized package inquiry from ${payload.name || 'a customer'}`,
      { inquiryId: created.id, email: payload.email }
    );
    
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    const updated = await setDoc(COLLECTION, req.params.id, {
      status,
      updatedAt: FieldValue.serverTimestamp()
    });
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
